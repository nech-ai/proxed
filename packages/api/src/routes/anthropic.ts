import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createExecution } from "@proxed/supabase/mutations";
import { type Context, Hono } from "hono";
import { proxy } from "hono/proxy";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../middleware/auth";
import type { AuthMiddlewareVariables, FinishReason } from "../types";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";
import { logger } from "@proxed/logger";
import { createError, ErrorCode } from "../utils/errors";
import { getCommonExecutionParams } from "../utils/execution-params";
import {
	mapAnthropicFinishReason,
	type AnthropicResponse,
} from "../utils/anthropic";
import { checkAndNotifyRateLimit } from "../utils/rate-limit";

const ANTHROPIC_API_BASE = "https://api.anthropic.com/v1";

async function handleAnthropicProxy(
	c: Context<{ Variables: AuthMiddlewareVariables }>,
	targetUrl: string,
) {
	const { projectId, teamId, apiKey } = c.get("session");
	const ip =
		c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip");
	const userAgent = c.req.header("user-agent");

	const supabase = createClient();
	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error || !project || !project.key) {
		throw createError(ErrorCode.PROJECT_NOT_FOUND);
	}

	if (!apiKey) {
		throw createError(ErrorCode.INTERNAL_ERROR, "API key not found in session");
	}

	const { data: serverKey, error: serverKeyError } = await supabase.rpc(
		"get_server_key",
		{
			p_provider_key_id: project.key_id,
		},
	);

	if (serverKeyError || !serverKey) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Failed to retrieve server key",
			{
				error: serverKeyError?.message,
			},
		);
	}

	const [fullApiKey] = reassembleKey(serverKey, apiKey).split(".");

	const startTime = Date.now();

	try {
		const response = await proxy(targetUrl, {
			...c.req,
			headers: {
				...c.req.header(),
				"x-api-key": fullApiKey,
				"anthropic-version": "2023-06-01",
				"content-type": "application/json",
			},
		});

		const latency = Date.now() - startTime;

		let responseData: AnthropicResponse = {};
		try {
			responseData = await response.clone().json();
		} catch (err) {
			logger.warn("Failed to parse Anthropic response as JSON", { error: err });
		}

		const usage = responseData.usage ?? {
			input_tokens: 0,
			output_tokens: 0,
		};

		const anthropicFinishReason = responseData.stop_reason;
		const finishReason = mapAnthropicFinishReason(anthropicFinishReason);

		await createExecution(supabase, {
			...getCommonExecutionParams({
				teamId,
				projectId,
				deviceCheckId: project.device_check_id,
				keyId: project.key_id,
				ip,
				userAgent,
				model: project.model,
				provider: project.key.provider,
				c,
			}),
			prompt_tokens: usage.input_tokens,
			completion_tokens: usage.output_tokens,
			finish_reason: finishReason,
			latency,
			response_code: response.status,
			response: JSON.stringify(responseData),
		});

		checkAndNotifyRateLimit({
			c,
			supabase,
			projectId,
			teamId,
			projectName: project.name,
		});

		return response;
	} catch (error) {
		const latency = Date.now() - startTime;
		logger.error("Anthropic proxy error:", error);

		await createExecution(supabase, {
			...getCommonExecutionParams({
				teamId,
				projectId,
				deviceCheckId: project.device_check_id,
				keyId: project.key_id,
				ip,
				userAgent,
				model: project.model,
				provider: project.key.provider,
				c,
			}),
			prompt_tokens: 0,
			completion_tokens: 0,
			finish_reason: "error" as FinishReason,
			latency,
			response_code: 500,
			error_message: error instanceof Error ? error.message : "Unknown error",
			error_code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
		});

		throw createError(
			ErrorCode.PROVIDER_ERROR,
			error instanceof Error ? error.message : "Anthropic service error",
			{
				originalError: error instanceof Error ? error.message : "Unknown error",
			},
		);
	}
}

export const anthropicRouter = new Hono<{
	Variables: AuthMiddlewareVariables;
}>()
	.use("/:projectId/*", authMiddleware)
	.all(
		"/:projectId/*",
		describeRoute({
			tags: ["Anthropic Proxy"],
			summary: "Anthropic API Proxy",
			description:
				"Proxies requests to Anthropic API with authentication and tracking",
			parameters: [
				{
					in: "path",
					name: "projectId",
					schema: { type: "string" },
					required: true,
					description: "The ID of the project",
				},
				{
					in: "path",
					name: "*",
					schema: { type: "string" },
					required: true,
					description: "The Anthropic API path to proxy to (e.g., messages)",
				},
			],
			responses: {
				200: { description: "Successful response" },
				400: { description: "Bad request" },
				401: { description: "Unauthorized" },
				500: { description: "Internal server error" },
			},
		}),
		async (c) => {
			const proxyPath = c.req.path.split(`/${c.req.param("projectId")}/`)[1];
			const targetUrl = `${ANTHROPIC_API_BASE}/${proxyPath}`;
			return handleAnthropicProxy(c, targetUrl);
		},
	);
