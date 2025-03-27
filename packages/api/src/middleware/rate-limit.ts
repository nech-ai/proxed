import { client as RedisClient } from "@proxed/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { createMiddleware } from "hono/factory";
import { createError, ErrorCode } from "../utils/errors";
import type { AppVariables } from "../types";

const ratelimit = new Ratelimit({
	limiter: Ratelimit.fixedWindow(10, "10s"),
	redis: RedisClient,
});

export const rateLimitMiddleware = createMiddleware<{
	Variables: AppVariables;
}>(async (c, next) => {
	const ip =
		c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip");
	const path = c.req.path;

	// Skip rate limiting for health check
	if (path === "/health" || path === "/v1/health") {
		await next();
		return;
	}

	const { success, remaining } = await ratelimit.limit(`${ip}-${path}`);

	if (!success) {
		throw createError(ErrorCode.TOO_MANY_REQUESTS, "Too many requests");
	}

	// Add rate limit info to response headers
	c.res.headers.set("X-RateLimit-Remaining", remaining.toString());

	await next();
});
