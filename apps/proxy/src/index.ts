import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { secureHeaders } from "hono/secure-headers";
import { routers, publicRouters } from "./rest/routers";
import type { Context } from "./rest/types";
import { errorHandlerMiddleware } from "./rest/middleware/error-handler";
import { loggerMiddleware } from "./rest/middleware/logger";
import { withCors } from "./rest/middleware/cors";
import { AppError, handleApiError } from "./utils/errors";
import { logger } from "./utils/logger";
import { v4 as uuidv4 } from "uuid";

export const app = new OpenAPIHono<Context>();

// Apply global middleware
app.use(secureHeaders());

// Add request ID middleware
app.use(async (c, next) => {
	const requestId = uuidv4();
	c.set("requestId", requestId);
	c.res.headers.set("x-request-id", requestId);
	await next();
});

app.use(loggerMiddleware);

// Global error handler
app.onError((err, c) => {
	const requestId = c.get("requestId") || uuidv4();
	const apiError = handleApiError(err);
	const session = c.get("session");
	const geo = c.get("geo");

	// Build error context
	const errorContext = {
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
			...(err instanceof AppError ? { details: err.details } : {}),
		},
		stack: err instanceof Error ? err.stack : undefined,
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
	c.res.headers.set("x-request-id", requestId);

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
});

// CORS for REST API
app.use("/v1/*", withCors);

// OpenAPI documentation
app.doc("/openapi", {
	openapi: "3.1.0",
	info: {
		version: "1.0.0",
		title: "Proxed API",
		description:
			"Proxed is a secure API proxy service for AI models with device authentication and rate limiting.",
		contact: {
			name: "Proxed Support",
			email: "support@proxed.ai",
			url: "https://proxed.ai",
		},
		license: {
			name: "MIT",
			url: "https://github.com/proxed-ai/proxed/blob/main/LICENSE",
		},
	},
	servers: [
		{
			url: "https://api.proxed.ai",
			description: "Production API",
		},
		{
			url: "http://localhost:3000",
			description: "Local Development",
		},
	],
	security: [
		{
			bearerAuth: [],
		},
	],
});

// Register security scheme
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	description: "Bearer token authentication using 'apiKey.deviceToken' format",
});

// Scalar API documentation UI
app.get(
	"/",
	Scalar({
		url: "/openapi",
		pageTitle: "Proxed API Documentation",
		theme: "purple",
	}),
);

// Mount public routes (health check)
app.route("/", publicRouters);

// Mount protected routes
app.route("/", routers);

export default {
	port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
	fetch: app.fetch,
};
