import { client as RedisClient } from "@proxed/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { createError, ErrorCode } from "../../utils/errors";
import type { MiddlewareHandler } from "hono";
import type { Context } from "../types";
import { logger } from "../../utils/logger";

// Rate limit configurations for different endpoints
const rateLimitConfigs = {
	default: { requests: 10, window: "10s" },
	ai: { requests: 5, window: "10s" },
	structured: { requests: 3, window: "10s" },
} as const;

// Create rate limiters for different endpoint types
const rateLimiters = {
	default: new Ratelimit({
		limiter: Ratelimit.fixedWindow(
			rateLimitConfigs.default.requests,
			rateLimitConfigs.default.window,
		),
		redis: RedisClient,
	}),
	ai: new Ratelimit({
		limiter: Ratelimit.fixedWindow(
			rateLimitConfigs.ai.requests,
			rateLimitConfigs.ai.window,
		),
		redis: RedisClient,
	}),
	structured: new Ratelimit({
		limiter: Ratelimit.fixedWindow(
			rateLimitConfigs.structured.requests,
			rateLimitConfigs.structured.window,
		),
		redis: RedisClient,
	}),
};

export const withRateLimit: MiddlewareHandler<Context> = async (c, next) => {
	const session = c.get("session");
	const geo = c.get("geo");
	const path = c.req.path;

	// Skip rate limiting for health check
	if (path === "/health" || path === "/v1/health") {
		await next();
		return;
	}

	// Determine rate limiter based on path
	let rateLimiter = rateLimiters.default;
	let limitType = "default";

	if (path.includes("/openai/") || path.includes("/anthropic/")) {
		rateLimiter = rateLimiters.ai;
		limitType = "ai";
	} else if (
		path.includes("/vision") ||
		path.includes("/text") ||
		path.includes("/pdf")
	) {
		rateLimiter = rateLimiters.structured;
		limitType = "structured";
	}

	// Use team ID for rate limiting if available, otherwise use IP
	const identifier = session?.teamId || geo?.ip || "unknown";
	const key = `${limitType}:${identifier}:${path}`;

	try {
		const { success, limit, remaining, reset } = await rateLimiter.limit(key);

		// Add rate limit info to response headers
		c.res.headers.set("X-RateLimit-Limit", limit.toString());
		c.res.headers.set("X-RateLimit-Remaining", remaining.toString());
		c.res.headers.set("X-RateLimit-Reset", new Date(reset).toISOString());

		if (!success) {
			logger.warn(
				`Rate limit exceeded: identifier=${identifier}, path=${path}, limitType=${limitType}, teamId=${session?.teamId}, ip=${geo?.ip}`,
			);

			throw createError(
				ErrorCode.TOO_MANY_REQUESTS,
				`Rate limit exceeded. Please retry after ${new Date(
					reset,
				).toISOString()}`,
				{
					limit,
					remaining: 0,
					reset: new Date(reset).toISOString(),
					retryAfter: Math.ceil((reset - Date.now()) / 1000),
				},
			);
		}

		await next();
	} catch (error) {
		// If Redis is down, log but don't block the request
		if (error instanceof Error && !error.message.includes("Rate limit")) {
			logger.error(
				`Rate limiting error: ${error.message}, identifier=${identifier}, path=${path}`,
			);
			// Continue without rate limiting
			await next();
		} else {
			throw error;
		}
	}
};
