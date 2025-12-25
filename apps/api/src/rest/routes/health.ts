import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { publicMiddleware } from "../middleware";
import type { Context } from "../types";
import { metrics } from "../../utils/metrics";
import { performHealthCheck } from "../../utils/health-checks";
import { circuitBreakers } from "../../utils/circuit-breaker";
import {
	errorResponseSchema,
	geoInfoResponseSchema,
	healthStatusSchema,
	metricsResponseSchema,
} from "../schemas";

const serverStartTime = Date.now();

const healthResponses: Record<
	200 | 503 | 500,
	{
		description: string;
		content: {
			"application/json": { schema: any };
		};
	}
> = {
	200: {
		description: "Service is healthy or degraded.",
		content: { "application/json": { schema: healthStatusSchema } },
	},
	503: {
		description: "Service is unhealthy.",
		content: { "application/json": { schema: healthStatusSchema } },
	},
	500: {
		description: "Unexpected error.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
};

const geoResponses: Record<
	200,
	{
		description: string;
		content: {
			"application/json": { schema: any };
		};
	}
> = {
	200: {
		description: "Geo information.",
		content: { "application/json": { schema: geoInfoResponseSchema } },
	},
};

const metricsResponses: Record<
	200 | 403,
	{
		description: string;
		content: {
			"application/json": { schema: any };
		};
	}
> = {
	200: {
		description: "Metrics data.",
		content: { "application/json": { schema: metricsResponseSchema } },
	},
	403: {
		description: "Forbidden - only available in development mode.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
};

const router = new OpenAPIHono<Context>();

router.openapi(
	createRoute({
		method: "get",
		path: "/health",
		summary: "Health check",
		operationId: "healthCheck",
		description:
			"Returns a detailed health snapshot including dependency checks, metrics, and circuit breaker states.",
		tags: ["Health"],
		responses: healthResponses,
	}) as any,
	async (c) => {
		const db = c.get("db");

		const healthStatus = await performHealthCheck(db, serverStartTime);

		const circuitBreakerStates = {
			openai: circuitBreakers.openai.getState(),
			anthropic: circuitBreakers.anthropic.getState(),
			google: circuitBreakers.google.getState(),
			database: circuitBreakers.database.getState(),
			redis: circuitBreakers.redis.getState(),
		};

		const fullHealthStatus = {
			...healthStatus,
			circuitBreakers: circuitBreakerStates,
		};

		const statusCode =
			healthStatus.status === "healthy"
				? 200
				: healthStatus.status === "degraded"
					? 200
					: 503;

		return c.json(fullHealthStatus, statusCode);
	},
);

router.use("/geo-info", ...publicMiddleware);

router.openapi(
	createRoute({
		method: "get",
		path: "/geo-info",
		summary: "Geo information",
		operationId: "geoInfo",
		description: "Returns geo information extracted from request headers.",
		tags: ["Health"],
		responses: geoResponses,
	}) as any,
	(c) => {
		const geo = c.get("geo");
		return c.json(geo, 200);
	},
);

router.openapi(
	createRoute({
		method: "get",
		path: "/metrics",
		summary: "Metrics",
		operationId: "metrics",
		description:
			"Returns current metrics (only available in development mode).",
		tags: ["Health"],
		responses: metricsResponses,
	}) as any,
	(c) => {
		if (process.env.NODE_ENV === "production") {
			return c.json(
				{ error: "Metrics endpoint is only available in development mode" },
				403,
			);
		}

		const currentMetrics = metrics.getMetrics();
		return c.json(currentMetrics, 200);
	},
);

export { router as healthRouter };
