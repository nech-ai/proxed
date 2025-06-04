import { getProjectQuery } from "../../db/queries/projects";
import { createExecution } from "../../db/queries/executions";
import { getServerKey } from "../../db/queries/server-keys";
import { type Context, Hono } from "hono";
import { proxy } from "hono/proxy";
import { describeRoute } from "hono-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { getCommonExecutionParams } from "../../utils/execution-params";
import {
	mapAnthropicFinishReason,
	type AnthropicResponse,
} from "../../utils/anthropic";
import { checkAndNotifyRateLimit } from "../../utils/rate-limit";

const ANTHROPIC_API_BASE = "https://api.anthropic.com/v1";

async function handleAnthropicProxy(c: Context<AppContext>, targetUrl: string) {
	const { projectId, teamId, apiKey } = c.get("session");
	const db = c.get("db");
	const geo = c.get("geo");
	const userAgent = c.req.header("user-agent");

	const project = await getProjectQuery(db, projectId);

	if (!project || !project.key) {
		throw createError(ErrorCode.PROJECT_NOT_FOUND);
	}

	if (!apiKey) {
		throw createError(ErrorCode.INTERNAL_ERROR, "API key not found in session");
	}

	const serverKey = await getServerKey(db, project.keyId);

	if (!serverKey) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Failed to retrieve server key",
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
			responseData = (await response.clone().json()) as AnthropicResponse;
		} catch (err) {
			logger.warn("Failed to parse Anthropic response as JSON", { error: err });
		}

		const usage = responseData.usage ?? {
			input_tokens: 0,
			output_tokens: 0,
		};

		const anthropicFinishReason = responseData.stop_reason;
		const finishReason = mapAnthropicFinishReason(anthropicFinishReason);

		await createExecution(db, {
			...getCommonExecutionParams({
				teamId,
				projectId,
				deviceCheckId: project.deviceCheckId,
				keyId: project.keyId,
				ip: geo.ip ?? undefined,
				userAgent,
				model: project.model,
				provider: project.key.provider,
				geo,
			}),
			promptTokens: usage.input_tokens,
			completionTokens: usage.output_tokens,
			totalTokens: usage.input_tokens + usage.output_tokens,
			finishReason: finishReason,
			latency,
			responseCode: response.status,
			response: JSON.stringify(responseData),
		});

		checkAndNotifyRateLimit({
			c,
			db,
			projectId,
			teamId,
			projectName: project.name,
		});

		return response;
	} catch (error) {
		const latency = Date.now() - startTime;
		logger.error("Anthropic proxy error:", error);

		await createExecution(db, {
			...getCommonExecutionParams({
				teamId,
				projectId,
				deviceCheckId: project.deviceCheckId,
				keyId: project.keyId,
				ip: geo.ip ?? undefined,
				userAgent,
				model: project.model,
				provider: project.key.provider,
				geo,
			}),
			promptTokens: 0,
			completionTokens: 0,
			totalTokens: 0,
			finishReason: "error" as FinishReason,
			latency,
			responseCode: 500,
			errorMessage: error instanceof Error ? error.message : "Unknown error",
			errorCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
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

export const anthropicRouter = new Hono<AppContext>()
	.use("/:projectId/*", ...protectedMiddleware)
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
