import type { Context } from "hono";
import { logger } from "./logger";

// Track if we've already logged the warning
let hasLoggedWaitUntilWarning = false;

/**
 * Safely executes a background task using `c.executionCtx.waitUntil` if available,
 * otherwise logs a warning and potentially awaits the promise (or lets it run without awaiting).
 *
 * @param c The Hono context.
 * @param promise The promise or async function to execute.
 */
export async function safeWaitUntil(
	c: Context<any>,
	promise: Promise<unknown>,
): Promise<void> {
	try {
		c.executionCtx.waitUntil(promise);
	} catch (e) {
		// executionCtx might not be available (e.g., running in Bun locally)
		if (
			!hasLoggedWaitUntilWarning &&
			process.env.SUPPRESS_WAITUNTIL_WARNING !== "true"
		) {
			hasLoggedWaitUntilWarning = true;
			logger.info(
				"Running in local/development mode - background tasks will execute synchronously. This is expected behavior outside of Cloudflare Workers.",
			);
		}

		// In development, we can choose to either:
		// 1. Run synchronously (current behavior - safer but slower)
		// await promise;

		// 2. Fire and forget (faster but no guarantees)
		promise.catch((error) => {
			logger.error(`Background task failed: ${error}`);
		});
	}
}
