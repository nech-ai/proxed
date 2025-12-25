import { logger as appLogger } from "../../utils/logger";
import { logger as createHonoLogger } from "hono/logger";
import type { MiddlewareHandler } from "hono";

/**
 * HTTP Request Logger Middleware
 *
 * Logs all incoming HTTP requests with structured information including:
 * - HTTP method and path
 * - Response status code
 * - Request duration
 * - Additional context from Hono's logger
 */
export const loggerMiddleware: MiddlewareHandler = createHonoLogger(
	(message: string, ...rest: string[]) => {
		// Parse the Hono logger message format: "<-- GET /path 200 12ms"
		const logPattern = /^(<--|-->) ([A-Z]+) ([^\s]+)(?: (\d+))?(?: (.+))?$/;
		const match = message.match(logPattern);

		if (match) {
			const [, direction, method, path, status, duration] = match;
			const isIncoming = direction === "<--";

			// Structure the log entry for better readability
			const logEntry = {
				type: isIncoming ? "REQUEST" : "RESPONSE",
				method,
				path,
				...(status && { status: Number.parseInt(status, 10) }),
				...(duration && { duration }),
				...(rest.length > 0 && { details: rest }),
				timestamp: new Date().toISOString(),
			};

			// Use appropriate log level based on status code
			if (status) {
				const statusCode = Number.parseInt(status, 10);
				if (statusCode >= 500) {
					appLogger.error(logEntry, "HTTP Request Error");
				} else if (statusCode >= 400) {
					appLogger.warn(logEntry, "HTTP Request Warning");
				} else {
					appLogger.info(logEntry, "HTTP Request");
				}
			} else {
				// For incoming requests without status
				appLogger.info(logEntry, "HTTP Request");
			}
		} else {
			// Fallback for non-standard log messages
			appLogger.info(
				{
					message,
					...(rest.length > 0 && { details: rest }),
					timestamp: new Date().toISOString(),
				},
				"HTTP Log",
			);
		}
	},
);
