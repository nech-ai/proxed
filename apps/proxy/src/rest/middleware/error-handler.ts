import type { MiddlewareHandler } from "hono";
import { AppError, handleApiError } from "../../utils/errors";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";
import type { Context as AppContext } from "../types";

export const errorHandlerMiddleware: MiddlewareHandler<AppContext> = async (
	c,
	next,
) => {
	// Add request ID for tracking
	const requestId = uuidv4();
	c.set("requestId", requestId);
	c.res.headers.set("x-request-id", requestId);

	try {
		await next();
	} catch (error) {
		const apiError = handleApiError(error);

		// Log error with request context
		logger.error(`Request error [${requestId}]:`, {
			path: c.req.path,
			method: c.req.method,
			error: apiError,
			...(error instanceof AppError ? { details: error.details } : {}),
		});

		return c.json(
			{
				error: apiError.code,
				message: apiError.message,
				...(apiError.details ? { details: apiError.details } : {}),
				requestId,
			},
			apiError.status as 400 | 401 | 403 | 404 | 500 | 502 | 503,
		);
	}
};
