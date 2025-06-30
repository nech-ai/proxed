import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import {
	mapGoogleFinishReason,
	type GoogleResponse,
} from "../../utils/google";
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

async function handleGoogleProxy(c: Context<AppContext>, targetUrl: string) {
	const startTime = Date.now();

	// Validate project and get configuration
	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	// Get full API key
	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);

	// Get provider configuration
	const providerConfig = getProviderConfig("GOOGLE");
	const userAgent = c.req.header("user-agent");

	try {
		// Build headers using provider config
		const headers = buildProviderHeaders("GOOGLE", fullApiKey, {
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
			provider: "google",
		});

		const { response, latency, retries } = await withTimeout(
			proxyOperation,
			providerConfig.timeout || 30000,
			"Google AI API request timed out",
		);

		// Collect metrics
		collectMetrics(
			"GOOGLE",
			project.id,
			c.req.method,
			response.status,
			latency,
		);

		// Extract usage information from Google response
		let responseData: GoogleResponse = {};
		try {
			responseData = (await response.clone().json()) as GoogleResponse;
		} catch (err) {
			logger.warn("Failed to parse Google response as JSON", {
				error: err,
				projectId: project.id,
			});
		}

		const usage = responseData.usageMetadata ?? {
			promptTokenCount: 0,
			candidatesTokenCount: 0,
			totalTokenCount: 0,
		};

		const googleFinishReason = responseData.candidates?.[0]?.finishReason;
		const finishReason = mapGoogleFinishReason(googleFinishReason);

		// Record successful execution
		await recordExecution(
			c,
			startTime,
			{
				promptTokens: usage.promptTokenCount || 0,
				completionTokens: usage.candidatesTokenCount || 0,
				totalTokens: usage.totalTokenCount || 0,
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
		logger.error("Google AI proxy error:", {
			error: error instanceof Error ? error.message : error,
			projectId: project.id,
			teamId,
			provider: "GOOGLE",
		});

		// Collect error metrics
		collectMetrics(
			"GOOGLE",
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
			error instanceof Error ? error.message : "Google AI service error",
			{
				originalError: error instanceof Error ? error.message : String(error),
				projectId: project.id,
			},
		);
	}
}

export const googleRouter = new Hono<AppContext>()
	.use("/:projectId/*", ...protectedMiddleware)
	.all(
		"/:projectId/*",
		describeRoute({
			tags: ["Google AI Proxy"],
			summary: "Google AI API Proxy",
			description:
				"Proxies requests to Google AI (Gemini) API with authentication and tracking",
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
						"The Google AI API path to proxy to (e.g., models/gemini-pro:generateContent)",
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
			const config = getProviderConfig("GOOGLE");
			const targetUrl = `${config.baseUrl}/${proxyPath}`;
			return handleGoogleProxy(c, targetUrl);
		},
	);