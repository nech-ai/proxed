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
import { PROVIDERS } from "@proxed/utils/lib/providers";
import { shouldStream } from "./stream-handler";
import { safeWaitUntil } from "./execution-context";
import {
	validateAndGetProject,
	getFullApiKey,
	recordExecution,
	withTimeout,
} from "./route-handlers";
import { getBooleanEnv } from "./env";
import { mapOpenAIFinishReason, type OpenAIResponse } from "./openai";
import { mapAnthropicFinishReason } from "./anthropic";
import { mapGoogleFinishReason } from "./google";
import { formatCostsForDB } from "@proxed/utils/lib/pricing";
import { updateExecution } from "@proxed/db/queries";

type ProviderSlug = "openai" | "anthropic" | "google";

type UsageMetrics = {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
};

type StreamMetrics = UsageMetrics & {
	finishReason?: FinishReason;
	model?: string;
};

export interface ProviderProxyOptions<TResponse> {
	provider: ProviderType;
	providerSlug: ProviderSlug;
	providerLabel: string;
	extractUsage: (response: TResponse) => UsageMetrics;
	mapFinishReason: (response: TResponse) => FinishReason;
	parseResponse?: (response: Response, projectId: string) => Promise<TResponse>;
}

function isJsonContentType(contentType: string | undefined): boolean {
	if (!contentType) return false;
	const normalized = contentType.toLowerCase();
	return (
		normalized.includes("application/json") ||
		normalized.includes("+json") ||
		normalized.includes("text/json") ||
		normalized.includes("text/plain")
	);
}

function parseJsonBody(
	body: ArrayBuffer | undefined,
	providerLabel: string,
): Record<string, unknown> | null {
	if (!body || body.byteLength === 0) return null;
	const text = new TextDecoder().decode(body);
	if (!text.trim()) return null;
	try {
		const parsed = JSON.parse(text) as unknown;
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
			return parsed as Record<string, unknown>;
		}
	} catch (error) {
		logger.debug(
			`Failed to parse ${providerLabel} request body: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
	return null;
}

function isStreamRequested(
	provider: ProviderType,
	targetUrl: string,
	body: Record<string, unknown> | null,
): boolean {
	if (provider === PROVIDERS.OPENAI || provider === PROVIDERS.ANTHROPIC) {
		return body?.stream === true;
	}

	if (provider === PROVIDERS.GOOGLE) {
		return targetUrl.includes(":streamGenerateContent");
	}

	return false;
}

function ensureOpenAIStreamUsage(body: Record<string, unknown>): boolean {
	const streamOptions = body.stream_options;
	const normalized =
		streamOptions &&
		typeof streamOptions === "object" &&
		!Array.isArray(streamOptions)
			? (streamOptions as Record<string, unknown>)
			: {};

	if (normalized.include_usage !== undefined) {
		return false;
	}

	body.stream_options = {
		...normalized,
		include_usage: true,
	};
	return true;
}

function extractErrorDetails(
	payload: unknown,
): { message: string; code: string } | null {
	if (!payload || typeof payload !== "object") return null;
	const data = payload as Record<string, unknown>;
	const error = data.error as Record<string, unknown> | undefined;

	const message =
		(typeof error?.message === "string" && error.message) ||
		(typeof data.message === "string" && data.message) ||
		undefined;

	const codeValue =
		(typeof error?.type === "string" && error.type) ||
		(typeof error?.code === "string" && error.code) ||
		(typeof data.code === "string" && data.code) ||
		(typeof data.status === "string" && data.status) ||
		(typeof error?.code === "number" && error.code) ||
		(typeof data.code === "number" && data.code) ||
		undefined;

	if (!message && codeValue === undefined) return null;

	return {
		message: message ?? "Upstream error",
		code: codeValue !== undefined ? String(codeValue) : "UPSTREAM_ERROR",
	};
}

function normalizeModelId(model: string, provider: ProviderType): string {
	const trimmed = model.trim();
	if (!trimmed) return trimmed;
	if (provider === PROVIDERS.GOOGLE) {
		const match = trimmed.match(/models\/([^/:]+)/i);
		if (match) return match[1];
	}
	return trimmed;
}

function extractModelFromResponse<TResponse>(
	provider: ProviderType,
	response: TResponse,
): string | null {
	if (!response || typeof response !== "object") return null;
	const data = response as Record<string, unknown>;
	if (provider === PROVIDERS.GOOGLE) {
		const modelVersion = data.modelVersion;
		if (typeof modelVersion === "string") {
			return normalizeModelId(modelVersion, provider);
		}
	}

	const model = data.model;
	if (typeof model === "string") {
		return normalizeModelId(model, provider);
	}

	return null;
}

function extractModelFromPayload(
	provider: ProviderType,
	payload: Record<string, unknown>,
): string | null {
	const directModel = payload.model;
	if (typeof directModel === "string") {
		return normalizeModelId(directModel, provider);
	}

	const modelVersion = payload.modelVersion;
	if (typeof modelVersion === "string") {
		return normalizeModelId(modelVersion, provider);
	}

	const nestedMessage = payload.message as Record<string, unknown> | undefined;
	if (nestedMessage?.model && typeof nestedMessage.model === "string") {
		return normalizeModelId(nestedMessage.model, provider);
	}

	const nestedResponse = payload.response as
		| Record<string, unknown>
		| undefined;
	if (nestedResponse?.model && typeof nestedResponse.model === "string") {
		return normalizeModelId(nestedResponse.model, provider);
	}

	return null;
}

function updateUsageFromPayload(
	provider: ProviderType,
	payload: Record<string, unknown>,
	state: StreamMetrics,
) {
	const usage = payload.usage as Record<string, unknown> | undefined;
	const responseUsage = (
		payload.response as Record<string, unknown> | undefined
	)?.usage as Record<string, unknown> | undefined;
	const messageUsage = (payload.message as Record<string, unknown> | undefined)
		?.usage as Record<string, unknown> | undefined;
	const usageMetadata = payload.usageMetadata as
		| Record<string, unknown>
		| undefined;

	const applyUsage = (usageData?: Record<string, unknown>) => {
		if (!usageData) return;
		const prompt =
			usageData.prompt_tokens ??
			usageData.input_tokens ??
			usageData.promptTokenCount;
		const completion =
			usageData.completion_tokens ??
			usageData.output_tokens ??
			usageData.candidatesTokenCount;
		const total = usageData.total_tokens ?? usageData.totalTokenCount;

		if (typeof prompt === "number") state.promptTokens = prompt;
		if (typeof completion === "number") state.completionTokens = completion;
		if (typeof total === "number") state.totalTokens = total;
	};

	applyUsage(usage);
	applyUsage(responseUsage);
	applyUsage(messageUsage);
	applyUsage(usageMetadata);

	if (provider === PROVIDERS.ANTHROPIC && usage) {
		const inputTokens = usage.input_tokens;
		const outputTokens = usage.output_tokens;
		if (typeof inputTokens === "number") state.promptTokens = inputTokens;
		if (typeof outputTokens === "number") state.completionTokens = outputTokens;
	}

	if (provider === PROVIDERS.GOOGLE && usageMetadata) {
		const prompt = usageMetadata.promptTokenCount;
		const completion = usageMetadata.candidatesTokenCount;
		const total = usageMetadata.totalTokenCount;
		if (typeof prompt === "number") state.promptTokens = prompt;
		if (typeof completion === "number") state.completionTokens = completion;
		if (typeof total === "number") state.totalTokens = total;
	}
}

function updateFinishReasonFromPayload(
	provider: ProviderType,
	payload: Record<string, unknown>,
	state: StreamMetrics,
) {
	if (provider === PROVIDERS.OPENAI) {
		const choices = payload.choices as OpenAIResponse["choices"] | undefined;
		const finish = choices?.[0]?.finish_reason;
		if (finish) {
			state.finishReason = mapOpenAIFinishReason(finish);
		}
		return;
	}

	if (provider === PROVIDERS.ANTHROPIC) {
		const delta = payload.delta as { stop_reason?: string | null } | undefined;
		const stopReason =
			delta?.stop_reason ??
			((payload.message as Record<string, unknown> | undefined)?.stop_reason as
				| string
				| null
				| undefined) ??
			(payload.stop_reason as string | null | undefined);
		if (stopReason) {
			state.finishReason = mapAnthropicFinishReason(stopReason);
		}
		return;
	}

	if (provider === PROVIDERS.GOOGLE) {
		const candidates = payload.candidates as
			| Array<{ finishReason?: string }>
			| undefined;
		const finishReason = candidates?.[0]?.finishReason;
		if (finishReason) {
			state.finishReason = mapGoogleFinishReason(finishReason);
		}
	}
}

function updateStreamMetricsFromPayload(
	provider: ProviderType,
	payload: Record<string, unknown>,
	state: StreamMetrics,
) {
	const model = extractModelFromPayload(provider, payload);
	if (model) state.model = model;

	updateUsageFromPayload(provider, payload, state);
	updateFinishReasonFromPayload(provider, payload, state);
}

export async function collectStreamMetrics(
	stream: ReadableStream<Uint8Array>,
	provider: ProviderType,
	contentType: string | null,
): Promise<StreamMetrics> {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	const metrics: StreamMetrics = {
		promptTokens: 0,
		completionTokens: 0,
		totalTokens: 0,
	};

	const isSse = contentType?.includes("text/event-stream");
	let buffer = "";
	let dataLines: string[] = [];

	const processPayload = (raw: string) => {
		const trimmed = raw.trim();
		if (!trimmed || trimmed === "[DONE]") return;
		try {
			const payload = JSON.parse(trimmed) as Record<string, unknown>;
			updateStreamMetricsFromPayload(provider, payload, metrics);
		} catch (error) {
			logger.debug(
				`Failed to parse streamed payload: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	};

	const flushSseEvent = () => {
		if (dataLines.length === 0) return;
		processPayload(dataLines.join("\n"));
		dataLines = [];
	};

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			if (buffer.length > 0) {
				if (isSse) {
					const line = buffer.replace(/\r$/, "");
					if (line.startsWith("data:")) {
						dataLines.push(line.replace(/^data:\s?/, ""));
					}
					flushSseEvent();
				} else {
					processPayload(buffer);
				}
			}
			break;
		}

		buffer += decoder.decode(value, { stream: true });

		if (isSse) {
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";
			for (const rawLine of lines) {
				const line = rawLine.replace(/\r$/, "");
				if (line === "") {
					flushSseEvent();
					continue;
				}
				if (line.startsWith("data:")) {
					dataLines.push(line.replace(/^data:\s?/, ""));
				}
			}
			continue;
		}

		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";
		for (const line of lines) {
			processPayload(line);
		}
	}

	if (metrics.totalTokens === 0) {
		metrics.totalTokens = metrics.promptTokens + metrics.completionTokens;
	}

	return metrics;
}

function extractModelFromUrl(targetUrl: string): string | null {
	try {
		const { pathname } = new URL(targetUrl);
		const match = pathname.match(/\/models\/([^/:]+)(?::|\/|$)/i);
		return match?.[1] ?? null;
	} catch {
		return null;
	}
}

async function extractModelFromRequest(
	c: Context<AppContext>,
	provider: ProviderType,
	targetUrl: string,
	requestBody?: ArrayBuffer,
): Promise<string | null> {
	const method = c.req.method.toUpperCase();
	if (method === "GET" || method === "HEAD") {
		const modelFromPath =
			provider === PROVIDERS.GOOGLE ? extractModelFromUrl(targetUrl) : null;
		return modelFromPath ? normalizeModelId(modelFromPath, provider) : null;
	}

	const modelFromPath =
		provider === PROVIDERS.GOOGLE ? extractModelFromUrl(targetUrl) : null;

	const contentType = c.req.header("content-type");
	if (!isJsonContentType(contentType)) {
		return modelFromPath ? normalizeModelId(modelFromPath, provider) : null;
	}

	try {
		const buffer = requestBody ?? (await c.req.arrayBuffer());
		if (!buffer || buffer.byteLength === 0) {
			return modelFromPath ? normalizeModelId(modelFromPath, provider) : null;
		}

		const text = new TextDecoder().decode(buffer);
		if (!text.trim()) {
			return modelFromPath ? normalizeModelId(modelFromPath, provider) : null;
		}

		const parsed = JSON.parse(text) as Record<string, unknown>;
		const model = parsed?.model;
		if (typeof model === "string" && model.trim().length > 0) {
			return normalizeModelId(model, provider);
		}
	} catch (error) {
		logger.debug(
			`Failed to parse request body for model extraction: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	return modelFromPath ? normalizeModelId(modelFromPath, provider) : null;
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

	const method = c.req.method.toUpperCase();
	let requestBody: ArrayBuffer | undefined;
	if (method !== "GET" && method !== "HEAD") {
		try {
			requestBody = await c.req.arrayBuffer();
		} catch (error) {
			logger.debug(
				`Failed to read request body for model extraction: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	const requestModel = await extractModelFromRequest(
		c,
		options.provider,
		targetUrl,
		requestBody,
	);

	const contentType = c.req.header("content-type");
	const parsedBody =
		isJsonContentType(contentType) && requestBody
			? parseJsonBody(requestBody, options.providerLabel)
			: null;
	const streamRequested = isStreamRequested(
		options.provider,
		targetUrl,
		parsedBody,
	);
	let mutatedBody = false;

	if (options.provider === PROVIDERS.OPENAI && streamRequested && parsedBody) {
		mutatedBody = ensureOpenAIStreamUsage(parsedBody);
		if (mutatedBody) {
			requestBody = new TextEncoder().encode(JSON.stringify(parsedBody)).buffer;
		}
	}

	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);
	const providerConfig = getProviderConfig(options.provider);
	const userAgent = c.req.header("user-agent");
	const requestId = c.get("requestId");
	const idempotencyKey =
		options.provider === PROVIDERS.OPENAI &&
		method !== "GET" &&
		method !== "HEAD"
			? (c.req.header("idempotency-key") ?? requestId)
			: undefined;

	try {
		const headers = buildProviderHeaders(options.provider, fullApiKey, {
			...c.req.header(),
			"User-Agent": userAgent || "Proxed-API",
		});
		if (streamRequested) {
			headers["accept-encoding"] = "identity";
		}
		if (mutatedBody) {
			headers["content-length"] = undefined;
		}
		if (idempotencyKey) {
			headers["Idempotency-Key"] = idempotencyKey;
		}

		const proxyOperation = baseProxy(c, targetUrl, {
			headers,
			maxRetries: providerConfig.maxRetries,
			retryDelay: providerConfig.retryDelay,
			timeout: providerConfig.timeout,
			debug: providerConfig.debug || process.env.NODE_ENV === "development",
			provider: options.providerSlug,
			body: requestBody,
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

		const isStreaming = shouldStream(response);
		if (isStreaming) {
			const contentType = response.headers.get("content-type");
			const shouldStoreStreamSummary = getBooleanEnv(
				"STREAM_STORE_SUMMARY",
				true,
			);
			const executionPromise = recordExecution(
				c,
				startTime,
				{
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0,
					finishReason: "unknown" as FinishReason,
					responseCode: response.status,
				},
				{ project, teamId },
				requestModel ? { overrideModel: requestModel } : undefined,
			);

			const body = response.body;
			if (body) {
				const [clientStream, monitorStream] = body.tee();

				const monitorPromise = (async () => {
					const executionId = await executionPromise;
					if (!executionId) return;

					const metrics = await collectStreamMetrics(
						monitorStream,
						options.provider,
						contentType,
					);
					const executionModel = metrics.model ?? requestModel ?? undefined;
					const finishReason =
						metrics.finishReason ?? ("unknown" as FinishReason);
					const totalTokens =
						metrics.totalTokens ||
						metrics.promptTokens + metrics.completionTokens;

					const costs =
						executionModel && project.key?.provider
							? formatCostsForDB({
									provider: project.key.provider,
									model: executionModel,
									promptTokens: metrics.promptTokens,
									completionTokens: metrics.completionTokens,
								})
							: undefined;

					const responseValue = shouldStoreStreamSummary
						? JSON.stringify({
								streamed: true,
								model: executionModel ?? null,
								finishReason,
								usage: {
									promptTokens: metrics.promptTokens,
									completionTokens: metrics.completionTokens,
									totalTokens,
								},
							})
						: undefined;

					await updateExecution(db, {
						id: executionId,
						model: executionModel,
						promptTokens: metrics.promptTokens,
						completionTokens: metrics.completionTokens,
						totalTokens,
						finishReason,
						response: responseValue,
						promptCost: costs?.promptCost,
						completionCost: costs?.completionCost,
						totalCost: costs?.totalCost,
					});
				})();

				void safeWaitUntil(c, monitorPromise);

				const streamedResponse = new Response(clientStream, {
					status: response.status,
					statusText: response.statusText,
					headers: response.headers,
				});

				if (contentType?.includes("text/event-stream")) {
					if (!streamedResponse.headers.get("cache-control")) {
						streamedResponse.headers.set("Cache-Control", "no-cache");
					}
					streamedResponse.headers.set("Connection", "keep-alive");
					streamedResponse.headers.set("X-Accel-Buffering", "no");
				}

				streamedResponse.headers.set("X-Proxed-Retries", retries.toString());
				streamedResponse.headers.set("X-Proxed-Latency", latency.toString());

				return streamedResponse;
			}

			void safeWaitUntil(c, executionPromise);

			response.headers.set("X-Proxed-Retries", retries.toString());
			response.headers.set("X-Proxed-Latency", latency.toString());

			return response;
		}

		const responseData = options.parseResponse
			? await options.parseResponse(response, project.id)
			: await parseJsonResponse<TResponse>(
					response,
					options.providerLabel,
					project.id,
				);

		const isErrorResponse = !response.ok;
		const usage = options.extractUsage(responseData);
		const finishReason = isErrorResponse
			? ("error" as FinishReason)
			: options.mapFinishReason(responseData);
		const responseModel = extractModelFromResponse(
			options.provider,
			responseData,
		);
		const executionModel = responseModel ?? requestModel;
		const errorDetails = isErrorResponse
			? (extractErrorDetails(responseData) ?? {
					message: "Upstream error",
					code: "UPSTREAM_ERROR",
				})
			: undefined;

		await recordExecution(
			c,
			startTime,
			{
				promptTokens: usage.promptTokens,
				completionTokens: usage.completionTokens,
				totalTokens: usage.totalTokens,
				finishReason,
				response: responseData,
				responseCode: response.status,
				error: errorDetails ?? undefined,
			},
			{ project, teamId },
			executionModel ? { overrideModel: executionModel } : undefined,
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
			requestModel ? { overrideModel: requestModel } : undefined,
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
