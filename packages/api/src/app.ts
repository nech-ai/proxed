import { getBaseUrl } from "@proxed/utils";
import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { corsMiddleware } from "./middleware/cors";
import { loggerMiddleware } from "./middleware/logger";
import { healthRouter } from "./routes/health";
import { structuredResponseRouter } from "./routes/structured-response";

export const app = new Hono().basePath("/api");

app.use(loggerMiddleware);
app.use(corsMiddleware);

app.route("/", healthRouter);
app.route("/structured-response", structuredResponseRouter);

app.get(
	"/openapi",
	openAPISpecs(app, {
		documentation: {
			info: {
				title: "Proxy API",
				version: "1.0.0",
			},
			servers: [
				{
					url: getBaseUrl(),
					description: "API server",
				},
			],
		},
	}),
);

app.get(
	"/docs",
	apiReference({
		theme: "saturn",
		spec: {
			url: "/api/structured-response",
		},
	}),
);

export type AppRouter = typeof app;
