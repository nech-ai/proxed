// server-only, @proxed/kv, @upstash/ratelimit mocks are in test-preload.ts

// NOW import other things
import { describe, test, expect, beforeEach } from "bun:test";
import { Hono } from "hono";
import { rateLimitMiddleware } from "../../middleware/rate-limit";
import { AppError, ErrorCode } from "../../utils/errors";
import type { AppVariables } from "../../types";

// Import the Ratelimit class (which is now the mocked class from preload)
import { Ratelimit as MockedRatelimitFromPreload } from "@upstash/ratelimit";

// Access the mock functions that were set up in preload
// These are the *actual* mock function instances that the code under test will use.
const actualMockLimitMethod = new (MockedRatelimitFromPreload as any)({}).limit;
const actualMockFixedWindow = (MockedRatelimitFromPreload as any).fixedWindow;

describe("rateLimitMiddleware", () => {
	let app: Hono<{ Variables: AppVariables }>;

	beforeEach(() => {
		actualMockLimitMethod.mockClear();
		actualMockLimitMethod.mockResolvedValue({ success: true, remaining: 9 });
		actualMockFixedWindow.mockClear();
		actualMockFixedWindow.mockReturnValue({ type: "fixedWindowConfig" }); // Reset to a consistent dummy object

		app = new Hono<{ Variables: AppVariables }>();

		app.onError((err, c) => {
			if (err instanceof AppError) {
				return c.json(
					{ error: err.code, message: err.message },
					err.status as any,
				);
			}
			// console.error('Unhandled test error:', err); // Keep this one if you want to see unhandled errors during tests
			return c.json(
				{ error: ErrorCode.INTERNAL_ERROR, message: "Unhandled test error" },
				500,
			);
		});

		app.use("*", rateLimitMiddleware);
		app.get("/test", (c) => c.text("ok"));
		app.get("/health", (c) => c.text("healthy"));
		app.get("/v1/health", (c) => c.text("healthy"));
	});

	test("should allow request if rate limit not exceeded", async () => {
		const res = await app.request("/test");
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("ok");
		expect(res.headers.get("X-RateLimit-Remaining")).toBe("9");
		expect(actualMockLimitMethod).toHaveBeenCalledTimes(1);
		expect(actualMockLimitMethod).toHaveBeenCalledWith("undefined-/test");
	});

	test("should use x-forwarded-for IP if present", async () => {
		await app.request("/test", { headers: { "x-forwarded-for": "1.2.3.4" } });
		expect(actualMockLimitMethod).toHaveBeenCalledWith("1.2.3.4-/test");
	});

	test("should use cf-connecting-ip if x-forwarded-for is not present", async () => {
		await app.request("/test", { headers: { "cf-connecting-ip": "5.6.7.8" } });
		expect(actualMockLimitMethod).toHaveBeenCalledWith("5.6.7.8-/test");
	});

	test("should return 429 error if rate limit exceeded", async () => {
		actualMockLimitMethod.mockResolvedValue({ success: false, remaining: 0 });
		const res = await app.request("/test");
		expect(res.status).toBe(429);
		const json = await res.json();
		expect(json.error).toBe(ErrorCode.TOO_MANY_REQUESTS);
		expect(json.message).toBe("Too many requests");
		expect(res.headers.get("X-RateLimit-Remaining")).toBeNull();
	});

	test("should skip rate limiting for /health path", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("healthy");
		expect(actualMockLimitMethod).not.toHaveBeenCalled();
		expect(res.headers.get("X-RateLimit-Remaining")).toBeNull();
	});

	test("should skip rate limiting for /v1/health path", async () => {
		const res = await app.request("/v1/health");
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("healthy");
		expect(actualMockLimitMethod).not.toHaveBeenCalled();
		expect(res.headers.get("X-RateLimit-Remaining")).toBeNull();
	});
});
