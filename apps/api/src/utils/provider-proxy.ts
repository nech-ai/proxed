import type { Context } from "hono";
import type {
	Context as AppContext,
	FinishReason,
	ProviderType,
} from "../rest/types";
import { logger } from "./logger";
import { createError, ErrorCode } from "./errors";
import { baseProxy } from "./base-proxy";
import { getProviderConfig, buildProviderHeaders } from "./provider-config";
import { collectMetrics } from "./metrics";
import {
	validateAndGetProject,
	getFullApiKey,
	recordExecution,
	withTimeout,
} from "./route-handlers";

type ProviderSlug = "openai" | "anthropic" | "google";

type UsageMetrics = {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
};

export interface ProviderProxyOptions<TResponse> {
	provider: ProviderType;
	providerSlug: ProviderSlug;
	providerLabel: string;
	extractUsage: (response: TResponse) => UsageMetrics;
	mapFinishReason: (response: TResponse) => FinishReason;
	parseResponse?: (response: Response, projectId: string) => Promise<TResponse>;
}

async function parseJsonResponse<TResponse>(
	response: Response,
	providerLabel: string,
	projectId: string,
): Promise<TResponse> {
	try {
		return (await response.clone().json()) as TResponse;
	} catch (err) {
		logger.warn(
			`Failed to parse ${providerLabel} response as JSON: ${err}, projectId=${projectId}`,
		);
		return {} as TResponse;
	}
}

export async function handleProviderProxy<TResponse>(
	c: Context<AppContext>,
	targetUrl: string,
	options: ProviderProxyOptions<TResponse>,
): Promise<Response> {
	const startTime = Date.now();

	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);
	const providerConfig = getProviderConfig(options.provider);
	const userAgent = c.req.header("user-agent");

	try {
		const headers = buildProviderHeaders(options.provider, fullApiKey, {
			...c.req.header(),
			"User-Agent": userAgent || "Proxed-API",
		});

		const proxyOperation = baseProxy(c, targetUrl, {
			headers,
			maxRetries: providerConfig.maxRetries,
			retryDelay: providerConfig.retryDelay,
			timeout: providerConfig.timeout,
			debug: providerConfig.debug || process.env.NODE_ENV === "development",
			provider: options.providerSlug,
		});

		const { response, latency, retries } = await withTimeout(
			proxyOperation,
			providerConfig.timeout || 30000,
			`${options.providerLabel} API request timed out`,
		);

		collectMetrics(
			options.provider,
			project.id,
			c.req.method,
			response.status,
			latency,
		);

		const responseData = options.parseResponse
			? await options.parseResponse(response, project.id)
			: await parseJsonResponse<TResponse>(
					response,
					options.providerLabel,
					project.id,
				);

		const usage = options.extractUsage(responseData);
		const finishReason = options.mapFinishReason(responseData);

		await recordExecution(
			c,
			startTime,
			{
				promptTokens: usage.promptTokens,
				completionTokens: usage.completionTokens,
				totalTokens: usage.totalTokens,
				finishReason,
				response: responseData,
			},
			{ project, teamId },
		);

		response.headers.set("X-Proxed-Retries", retries.toString());
		response.headers.set("X-Proxed-Latency", latency.toString());

		return response;
	} catch (error) {
		const latency = Date.now() - startTime;
		logger.error(
			`${options.providerLabel} proxy error: ${error instanceof Error ? error.message : error}`,
		);

		collectMetrics(
			options.provider,
			project.id,
			c.req.method,
			500,
			latency,
			error instanceof Error ? error.name : "UNKNOWN_ERROR",
		);

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
			error instanceof Error
				? error.message
				: `${options.providerLabel} service error`,
			{
				originalError: error instanceof Error ? error.message : String(error),
				projectId: project.id,
			},
		);
	}
}
