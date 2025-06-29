import type { Context } from "hono";
import { proxy } from "hono/proxy";
import type { Context as AppContext } from "../rest/types";
import { logger } from "./logger";
import { sanitizeRequestHeaders, filterResponseHeaders } from "./proxy-headers";
import { AppError, ErrorCode } from "./errors";
import {
	shouldStream,
	handleSSEStream,
	handleRawStream,
} from "./stream-handler";
import { circuitBreakers } from "./circuit-breaker";

export interface ProxyConfig {
	/**
	 * Maximum number of retry attempts
	 */
	maxRetries?: number;
	/**
	 * Retry delay in milliseconds (exponential backoff will be applied)
	 */
	retryDelay?: number;
	/**
	 * Timeout in milliseconds
	 */
	timeout?: number;
	/**
	 * Custom headers to set (will override any existing headers)
	 */
	headers: Record<string, string | undefined>;
	/**
	 * Whether to log request/response details
	 */
	debug?: boolean;
	/**
	 * Provider name for circuit breaker
	 */
	provider?: "openai" | "anthropic";
}

export interface ProxyResult {
	response: Response;
	latency: number;
	retries: number;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(status: number): boolean {
	// Retry on 429 (rate limit), 502 (bad gateway), 503 (service unavailable), 504 (gateway timeout)
	return status === 429 || status === 502 || status === 503 || status === 504;
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
	// Exponential backoff: delay = baseDelay * 2^attempt
	const exponentialDelay = baseDelay * 2 ** attempt;
	// Add jitter (0-25% of the delay) to prevent thundering herd
	const jitter = exponentialDelay * Math.random() * 0.25;
	return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
}

/**
 * Sleep for the specified duration
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Base proxy handler with retry logic and error handling
 */
export async function baseProxy(
	c: Context<AppContext>,
	targetUrl: string,
	config: ProxyConfig,
): Promise<ProxyResult> {
	const {
		maxRetries = 2,
		retryDelay = 1000,
		timeout = 30000,
		headers,
		debug = false,
		provider,
	} = config;

	// Get circuit breaker if provider is specified
	const circuitBreaker = provider ? circuitBreakers[provider] : null;

	// Sanitize headers
	const sanitizedHeaders = sanitizeRequestHeaders(c.req.header(), headers);

	if (debug) {
		logger.debug("Proxy request", {
			targetUrl,
			method: c.req.method,
			headers: Object.fromEntries(
				Object.entries(sanitizedHeaders).map(([k, v]) => [
					k,
					k.toLowerCase().includes("key") ||
					k.toLowerCase().includes("authorization")
						? `${v?.substring(0, 10)}...`
						: v,
				]),
			),
		});
	}

	let lastError: Error | null = null;
	let retries = 0;
	const startTime = Date.now();

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			// Add timeout using AbortController
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				// Execute the proxy request with circuit breaker if available
				const executeRequest = async () => {
					const response = await proxy(targetUrl, {
						...c.req,
						headers: sanitizedHeaders,
						signal: controller.signal,
					});
					return response;
				};

				const response = circuitBreaker
					? await circuitBreaker.execute(executeRequest)
					: await executeRequest();

				clearTimeout(timeoutId);

				const latency = Date.now() - startTime;

				// Log non-2xx responses
				if (!response.ok && debug) {
					const errorBody = await response.clone().text();
					logger.warn("Upstream API error response", {
						status: response.status,
						statusText: response.statusText,
						body: errorBody.substring(0, 500), // Limit log size
						targetUrl,
						attempt,
					});
				}

				// Check if we should retry
				if (
					!response.ok &&
					isRetryableError(response.status) &&
					attempt < maxRetries
				) {
					retries++;
					const delay = calculateRetryDelay(attempt, retryDelay);

					logger.info("Retrying proxy request", {
						status: response.status,
						attempt: attempt + 1,
						maxRetries,
						delayMs: delay,
						targetUrl,
					});

					await sleep(delay);
					continue;
				}

				// Filter response headers
				const filteredHeaders = filterResponseHeaders(response.headers);

				// Create new response with filtered headers
				const filteredResponse = new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers: filteredHeaders,
				});

				// Check if we need to handle streaming
				if (shouldStream(response)) {
					logger.debug("Detected streaming response", {
						contentType: response.headers.get("content-type"),
						transferEncoding: response.headers.get("transfer-encoding"),
					});

					// For SSE streams, use SSE handler
					if (
						response.headers.get("content-type")?.includes("text/event-stream")
					) {
						return {
							response: await handleSSEStream(c, filteredResponse, {
								onStart: () => logger.debug("SSE stream started"),
								onEnd: () => logger.debug("SSE stream ended"),
								onError: (error) => logger.error("SSE stream error", { error }),
							}),
							latency,
							retries,
						};
					}

					// For other streams, use raw handler
					return {
						response: await handleRawStream(c, filteredResponse, {
							onStart: () => logger.debug("Raw stream started"),
							onEnd: () => logger.debug("Raw stream ended"),
							onError: (error) => logger.error("Raw stream error", { error }),
						}),
						latency,
						retries,
					};
				}

				return {
					response: filteredResponse,
					latency,
					retries,
				};
			} finally {
				clearTimeout(timeoutId);
			}
		} catch (error) {
			lastError = error as Error;

			// Check if it's a timeout
			if (error instanceof Error && error.name === "AbortError") {
				logger.error("Proxy request timeout", {
					targetUrl,
					timeout,
					attempt,
				});

				if (attempt < maxRetries) {
					retries++;
					const delay = calculateRetryDelay(attempt, retryDelay);
					await sleep(delay);
					continue;
				}

				throw new AppError(ErrorCode.PROVIDER_ERROR, "Request timeout", 504, {
					timeout,
					targetUrl,
				});
			}

			// Log other errors
			logger.error("Proxy request failed", {
				error: error instanceof Error ? error.message : "Unknown error",
				targetUrl,
				attempt,
			});

			// Retry on network errors
			if (attempt < maxRetries) {
				retries++;
				const delay = calculateRetryDelay(attempt, retryDelay);
				await sleep(delay);
			}
		}
	}

	// All retries exhausted
	throw new AppError(
		ErrorCode.PROVIDER_ERROR,
		lastError?.message || "Proxy request failed after retries",
		502,
		{ retries: maxRetries, targetUrl },
	);
}
