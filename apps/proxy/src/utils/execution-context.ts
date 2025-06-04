import type { Context } from "hono";
import { logger } from "./logger";

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
		logger.warn(
			"executionCtx.waitUntil is not available in this environment. Background task might run synchronously or not be guaranteed completion.",
			{ error: e instanceof Error ? e.message : String(e) },
		);
		// If waitUntil is not available, run the promise synchronously.
		// Be aware this makes the request synchronous in these environments.
		await promise;
	}
}
