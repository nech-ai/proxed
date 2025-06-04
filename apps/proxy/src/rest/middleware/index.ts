import type { MiddlewareHandler } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { withAuth } from "./auth";
import { withDatabase } from "./db";
import { withPrimaryReadAfterWrite } from "./primary-read-after-write";
import { withRateLimit } from "./rate-limit";

/**
 * Public endpoint middleware - only attaches database with smart routing
 * No authentication required
 */
export const publicMiddleware: MiddlewareHandler[] = [withDatabase];

/**
 * Protected endpoint middleware - requires authentication
 * Includes database with smart routing and authentication
 * Note: withAuth must be first to set session in context
 */
export const protectedMiddleware: MiddlewareHandler[] = [
	withDatabase,
	withAuth,
	withRateLimit,
	withPrimaryReadAfterWrite,
];
