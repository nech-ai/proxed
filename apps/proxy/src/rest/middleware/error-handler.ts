import type { MiddlewareHandler } from "hono";
import { AppError, handleApiError } from "../../utils/errors";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";
import type { Context as AppContext } from "../types";

interface ErrorContext {
	requestId: string;
	path: string;
	method: string;
	headers: Record<string, string | undefined>;
	ip?: string;
	userAgent?: string;
	projectId?: string;
	teamId?: string;
	timestamp: string;
}

export const errorHandlerMiddleware: MiddlewareHandler<AppContext> = async (
	c,
	next,
) => {
	// Add request ID for tracking
	const requestId = uuidv4();
	c.set("requestId", requestId);
	c.res.headers.set("x-request-id", requestId);

	const startTime = Date.now();

	try {
		await next();

		// Log slow requests
		const duration = Date.now() - startTime;
		if (duration > 5000) {
			logger.warn("Slow request detected", {
				requestId,
				path: c.req.path,
				method: c.req.method,
				durationMs: duration,
			});
		}
	} catch (error) {
		const apiError = handleApiError(error);
		const session = c.get("session");
		const geo = c.get("geo");

		// Build error context
		const errorContext: ErrorContext = {
			requestId,
			path: c.req.path,
			method: c.req.method,
			headers: {
				"user-agent": c.req.header("user-agent"),
				"content-type": c.req.header("content-type"),
			},
			ip: geo?.ip,
			userAgent: c.req.header("user-agent"),
			projectId: session?.projectId,
			teamId: session?.teamId,
			timestamp: new Date().toISOString(),
		};

		// Log error with full context
		const logData = {
			...errorContext,
			error: {
				code: apiError.code,
				message: apiError.message,
				status: apiError.status,
				...(error instanceof AppError ? { details: error.details } : {}),
			},
			duration: Date.now() - startTime,
			stack: error instanceof Error ? error.stack : undefined,
		};

		// Use appropriate log level based on status code
		if (apiError.status >= 500) {
			logger.error("Server error", logData);
		} else if (apiError.status >= 400) {
			logger.warn("Client error", logData);
		} else {
			logger.info("Request error", logData);
		}

		// Add security headers
		c.res.headers.set("X-Content-Type-Options", "nosniff");
		c.res.headers.set("X-Frame-Options", "DENY");
		c.res.headers.set("X-XSS-Protection", "1; mode=block");

		return c.json(
			{
				error: apiError.code,
				message: apiError.message,
				...(apiError.details && process.env.NODE_ENV !== "production"
					? { details: apiError.details }
					: {}),
				requestId,
				timestamp: new Date().toISOString(),
			},
			apiError.status as 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503,
		);
	}
};
