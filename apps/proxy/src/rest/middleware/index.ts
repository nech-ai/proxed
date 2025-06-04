import type { MiddlewareHandler } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { withAuth } from "./auth";
import { withDatabase } from "./db";
import { withGeo } from "./geo";
import { withPrimaryReadAfterWrite } from "./primary-read-after-write";
import { withRateLimit } from "./rate-limit";

/**
 * Public endpoint middleware - only attaches database with smart routing and geo context
 * No authentication required
 */
export const publicMiddleware: MiddlewareHandler[] = [withDatabase, withGeo];

/**
 * Protected endpoint middleware - requires authentication
 * Includes database with smart routing, geo context, and authentication
 * Note: withAuth must come after withDatabase and withGeo
 */
export const protectedMiddleware: MiddlewareHandler[] = [
	withDatabase,
	withGeo,
	withAuth,
	withRateLimit,
	withPrimaryReadAfterWrite,
];
