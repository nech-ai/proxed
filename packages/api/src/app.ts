import { getBaseUrl } from "@proxed/utils";
import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { corsMiddleware } from "./middleware/cors";
import { loggerMiddleware } from "./middleware/logger";
import { errorHandlerMiddleware } from "./middleware/error-handler";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { healthRouter } from "./routes/health";
import { visionResponseRouter } from "./routes/vision";
import { textResponseRouter } from "./routes/text";
import { pdfResponseRouter } from "./routes/pdf";
import { logger } from "@proxed/logger";
import { openaiRouter } from "./routes/openai";
import { ErrorCode, handleApiError } from "./utils/errors";
import type { AppVariables } from "./types";
import { sendExecutionErrorNotifications } from "@proxed/jobs";

const root = new Hono<{ Variables: AppVariables }>();

root.use(loggerMiddleware);
root.use(corsMiddleware);
root.use(errorHandlerMiddleware);
root.use(rateLimitMiddleware);

const apiV1 = new Hono<{ Variables: AppVariables }>().basePath("/v1");
apiV1.use(loggerMiddleware);
apiV1.use(corsMiddleware);
apiV1.use(errorHandlerMiddleware);
apiV1.use(rateLimitMiddleware);

apiV1.route("/", healthRouter);
apiV1.route("/vision", visionResponseRouter);
apiV1.route("/text", textResponseRouter);
apiV1.route("/pdf", pdfResponseRouter);
apiV1.route("/openai", openaiRouter);
export const app = new Hono<{ Variables: AppVariables }>();

app.route("/", root);
app.route("/", apiV1);

app.get(
	"/vision",
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
		url: "/vision",
	}),
);

app.onError((err, c) => {
	const requestId = c.get("requestId") || "unknown";
	logger.error(`Global error handler [${requestId}]:`, err);
	const apiError = handleApiError(err);
	return c.json(
		{
			error: apiError.code,
			message: apiError.message,
			requestId,
		},
		apiError.status as 400 | 401 | 403 | 404 | 500 | 502 | 503,
	);
});

export type AppRouter = typeof app;
