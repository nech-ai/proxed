import { getBaseUrl } from "@proxed/utils";
import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { corsMiddleware } from "./middleware/cors";
import { loggerMiddleware } from "./middleware/logger";
import { healthRouter } from "./routes/health";
import { structuredResponseRouter } from "./routes/structured-response";
import { logger } from "@proxed/logger";

const root = new Hono();

root.use(loggerMiddleware);
root.use(corsMiddleware);

const apiV1 = new Hono().basePath("/v1");
apiV1.use(loggerMiddleware);
apiV1.use(corsMiddleware);

apiV1.route("/", healthRouter);
apiV1.route("/structured-response", structuredResponseRouter);

export const app = new Hono();

app.route("/", root);
app.route("/", apiV1);

app.get(
	"/structured-response",
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
	"/",
	apiReference({
		theme: "saturn",
		spec: {
			url: "/structured-response",
		},
	}),
);

app.onError((err, c) => {
	logger.error("Unhandled error in app", err);
	return c.json({ error: "Internal server error" }, 500);
});

export type AppRouter = typeof app;
