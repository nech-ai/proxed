import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { secureHeaders } from "hono/secure-headers";
import { routers, publicRouters } from "./rest/routers";
import type { Context } from "./rest/types";
import { errorHandlerMiddleware } from "./rest/middleware/error-handler";
import { loggerMiddleware } from "./rest/middleware/logger";
import { withCors } from "./rest/middleware/cors";

const app = new OpenAPIHono<Context>();

// Apply global middleware
app.use(secureHeaders());
app.use(loggerMiddleware);
app.use(errorHandlerMiddleware);

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
