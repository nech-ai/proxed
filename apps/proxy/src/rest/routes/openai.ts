import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { mapOpenAIFinishReason, type OpenAIResponse } from "../../utils/openai";
import { baseProxy } from "../../utils/base-proxy";
import {
	getProviderConfig,
	buildProviderHeaders,
} from "../../utils/provider-config";
import { collectMetrics } from "../../utils/metrics";
import {
	validateAndGetProject,
	getFullApiKey,
	recordExecution,
	withTimeout,
} from "../../utils/route-handlers";

async function handleOpenAIProxy(c: Context<AppContext>, targetUrl: string) {
	const startTime = Date.now();

	// Validate project and get configuration
	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	// Get full API key
	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);

	// Get provider configuration
	const providerConfig = getProviderConfig("OPENAI");
	const userAgent = c.req.header("user-agent");

	try {
		// Build headers using provider config
		const headers = buildProviderHeaders("OPENAI", fullApiKey, {
			...c.req.header(),
			"User-Agent": userAgent || "Proxed-API",
		});

		// Use the base proxy with provider-specific configuration and timeout
		const proxyOperation = baseProxy(c, targetUrl, {
			headers,
			maxRetries: providerConfig.maxRetries,
			retryDelay: providerConfig.retryDelay,
			timeout: providerConfig.timeout,
			debug: providerConfig.debug || process.env.NODE_ENV === "development",
			provider: "openai",
		});

		const { response, latency, retries } = await withTimeout(
			proxyOperation,
			providerConfig.timeout || 30000,
			"OpenAI API request timed out",
		);

		// Collect metrics
		collectMetrics(
			"OPENAI",
			project.id,
			c.req.method,
			response.status,
			latency,
		);

		// Extract usage information from OpenAI response
		let responseData: OpenAIResponse = {};
		try {
			responseData = (await response.clone().json()) as OpenAIResponse;
		} catch (err) {
			logger.warn(
				`Failed to parse OpenAI response as JSON: ${err}, projectId=${project.id}`,
			);
		}

		const usage = responseData.usage ?? {
			prompt_tokens: 0,
			completion_tokens: 0,
			total_tokens: 0,
		};

		const openaiFinishReason = responseData.choices?.[0]?.finish_reason;
		const finishReason = mapOpenAIFinishReason(openaiFinishReason);

		// Record successful execution
		await recordExecution(
			c,
			startTime,
			{
				promptTokens: usage.prompt_tokens,
				completionTokens: usage.completion_tokens,
				totalTokens: usage.total_tokens || 0,
				finishReason: finishReason,
				response: responseData,
			},
			{ project, teamId },
		);

		// Add custom headers for debugging
		response.headers.set("X-Proxed-Retries", retries.toString());
		response.headers.set("X-Proxed-Latency", latency.toString());

		return response;
	} catch (error) {
		const latency = Date.now() - startTime;
		logger.error(
			`OpenAI proxy error: ${error instanceof Error ? error.message : error}`,
		);

		// Collect error metrics
		collectMetrics(
			"OPENAI",
			project.id,
			c.req.method,
			500,
			latency,
			error instanceof Error ? error.name : "UNKNOWN_ERROR",
		);

		// Record failed execution
		await recordExecution(
			c,
			startTime,
			{
				promptTokens: 0,
				completionTokens: 0,
				totalTokens: 0,
				finishReason: "error" as FinishReason,
				error: {
					message: error instanceof Error ? error.message : "Unknown error",
					code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
				},
			},
			{ project, teamId },
		);

		throw createError(
			ErrorCode.PROVIDER_ERROR,
			error instanceof Error ? error.message : "OpenAI service error",
			{
				originalError: error instanceof Error ? error.message : String(error),
				projectId: project.id,
			},
		);
	}
}

export const openaiRouter = new Hono<AppContext>()
	.use("/:projectId/*", ...protectedMiddleware)
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
			const config = getProviderConfig("OPENAI");
			const targetUrl = `${config.baseUrl}/${proxyPath}`;
			return handleOpenAIProxy(c, targetUrl);
		},
	);
