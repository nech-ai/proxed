import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createExecution } from "@proxed/supabase/mutations";
import { type Context, Hono } from "hono";
import { proxy } from "hono/proxy";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../middleware/auth";
import type { AuthMiddlewareVariables } from "../types";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";
import { logger } from "@proxed/logger";
import { Headers } from "@proxed/location/constants";

const OPENAI_API_BASE = "https://api.openai.com/v1";

type CommonExecutionParams = {
	teamId: string;
	projectId: string;
	deviceCheckId: string;
	keyId: string;
	ip: string | undefined;
	userAgent: string | undefined;
	model: string;
	provider: "OPENAI" | "ANTHROPIC";
	c: Context;
};

const getCommonExecutionParams = ({
	teamId,
	projectId,
	deviceCheckId,
	keyId,
	ip,
	userAgent,
	model,
	provider,
	c,
}: CommonExecutionParams) => ({
	team_id: teamId,
	project_id: projectId,
	device_check_id: deviceCheckId,
	key_id: keyId,
	ip,
	user_agent: userAgent ?? undefined,
	model,
	provider,
	country_code: c.req.header(Headers.CountryCode),
	region_code: c.req.header(Headers.RegionCode),
	city: c.req.header(Headers.City),
	longitude:
		Number.parseFloat(c.req.header(Headers.Longitude) ?? "0") || undefined,
	latitude:
		Number.parseFloat(c.req.header(Headers.Latitude) ?? "0") || undefined,
});

async function handleOpenAIProxy(
	c: Context<{ Variables: AuthMiddlewareVariables }>,
	targetUrl: string,
) {
	const { projectId, teamId } = c.get("session");
	const ip =
		c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip");
	const userAgent = c.req.header("user-agent");

	const supabase = createClient();
	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error || !project || !project.key) {
		return c.json({ error: "Project not found" }, 404);
	}

	const apiKey = c.req.header("x-ai-key");

	// Get the server key part using the function
	const { data: serverKey } = await supabase.rpc("get_server_key", {
		p_provider_key_id: project.key_id,
	});

	const [fullApiKey] = reassembleKey(serverKey, apiKey).split(".");

	const startTime = Date.now();

	try {
		const response = await proxy(targetUrl, {
			...c.req,
			headers: {
				...c.req.header(),
				Authorization: `Bearer ${fullApiKey}`,
			},
		});

		const latency = Date.now() - startTime;

		// Extract usage information from OpenAI response
		const responseData = await response.clone().json();
		const usage = responseData.usage ?? {
			prompt_tokens: 0,
			completion_tokens: 0,
			total_tokens: 0,
		};

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
			prompt_tokens: usage.prompt_tokens,
			completion_tokens: usage.completion_tokens,
			finish_reason: responseData.choices?.[0]?.finish_reason ?? "unknown",
			latency,
			response_code: response.status,
			response: JSON.stringify(responseData),
		});

		return response;
	} catch (error) {
		logger.error("OpenAI proxy error:", error);
		const latency = Date.now() - startTime;

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
			finish_reason: "error",
			latency,
			response_code: 500,
			error_message: error instanceof Error ? error.message : "Unknown error",
			error_code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
		});

		return c.json({ error: (error as Error).message }, 500);
	}
}

export const openaiRouter = new Hono<{
	Variables: AuthMiddlewareVariables;
}>()
	.use("/:projectId/*", authMiddleware)
	.all(
		"/:projectId/*",
		describeRoute({
			tags: ["OpenAI Proxy"],
			summary: "OpenAI API Proxy",
			description:
				"Proxies requests to OpenAI API with authentication and tracking",
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
					description:
						"The OpenAI API path to proxy to (e.g., chat/completions, embeddings, etc.)",
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
			const targetUrl = `${OPENAI_API_BASE}/${proxyPath}`;
			return handleOpenAIProxy(c, targetUrl);
		},
	);
