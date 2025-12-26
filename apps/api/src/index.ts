import { trpcServer } from "@hono/trpc-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { secureHeaders } from "hono/secure-headers";
import { etag } from "hono/etag";
import { timing } from "hono/timing";
import { routers, publicRouters } from "./rest/routers";
import type { Context } from "./rest/types";
import { withCors } from "./rest/middleware/cors";
import { handleApiError } from "./utils/errors";
import { logger } from "./utils/logger";
import { v4 as uuidv4 } from "uuid";
import { createTRPCContext } from "./trpc/init";
import { appRouter } from "./trpc/routers/_app";

export const app = new OpenAPIHono<Context>();

app.use(etag());
app.use(timing());
app.use(secureHeaders());

app.use(async (c, next) => {
	const requestId = uuidv4();
	c.set("requestId", requestId);
	c.res.headers.set("x-request-id", requestId);
	await next();
});

app.onError((err, c) => {
	const requestId = c.get("requestId") || uuidv4();
	const apiError = handleApiError(err);
	const session = c.get("session");
	const geo = c.get("geo");

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

	const logData = {
		...errorContext,
		error: {
			code: apiError.code,
			message: apiError.message,
			status: apiError.status,
			details: apiError.details,
		},
		stack:
			process.env.NODE_ENV !== "production" && err instanceof Error
				? err.stack
				: undefined,
		timing: c.res.headers.get("server-timing"),
	};

	if (apiError.status >= 500) {
		logger.error(logData, "Server error");
	} else if (apiError.status >= 400) {
		logger.warn(logData, "Client error");
	} else {
		logger.info(logData, "Request error");
	}

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

app.use("/v1/*", withCors);
app.use("/trpc/*", withCors);

app.doc31("/openapi", {
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
	tags: [
		{ name: "OpenAI Proxy", description: "OpenAI pass-through endpoints." },
		{
			name: "Anthropic Proxy",
			description: "Anthropic pass-through endpoints.",
		},
		{ name: "Google AI Proxy", description: "Gemini pass-through endpoints." },
		{
			name: "Structured Response",
			description:
				"Structured generation endpoints for text, vision, and PDF inputs.",
		},
		{ name: "Image Generation", description: "Image generation endpoints." },
		{ name: "Health", description: "Service health and metrics." },
	],
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

app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	description:
		"Bearer token authentication using 'partialApiKey.deviceToken' format.",
});

app.get(
	"/",
	Scalar({
		url: "/openapi",
		pageTitle: "Proxed API Documentation",
		theme: "saturn",
	}),
);

app.route("/", publicRouters);
app.route("/", routers);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: createTRPCContext,
	}),
);

export default {
	port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
	fetch: app.fetch,
};
