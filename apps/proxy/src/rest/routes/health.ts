import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { publicMiddleware } from "../middleware";
import type { Context } from "../types";
import { metrics } from "../../utils/metrics";
import { logger } from "../../utils/logger";

interface HealthStatus {
	status: "healthy" | "degraded" | "unhealthy";
	timestamp: string;
	uptime: number;
	checks: {
		database?: "ok" | "error";
		redis?: "ok" | "error";
	};
	version: string;
}

// Track server start time
const serverStartTime = Date.now();

export const healthRouter = new Hono<Context>()
	.get(
		"/health",
		describeRoute({
			tags: ["Health"],
			summary: "Health check",
			description: "Returns 200 if the server is healthy with detailed status",
			responses: {
				200: {
					description: "Service is healthy",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									status: {
										type: "string",
										enum: ["healthy", "degraded", "unhealthy"],
									},
									timestamp: { type: "string" },
									uptime: { type: "number" },
									checks: { type: "object" },
									version: { type: "string" },
								},
							},
						},
					},
				},
			},
		}),
		async (c) => {
			const healthStatus: HealthStatus = {
				status: "healthy",
				timestamp: new Date().toISOString(),
				uptime: Date.now() - serverStartTime,
				checks: {},
				version: process.env.npm_package_version || "unknown",
			};

			// Quick DB check - don't want health check to be slow
			try {
				const db = c.get("db");
				if (db) {
					// Simple query to check DB connectivity
					await Promise.race([
						db.execute("SELECT 1"),
						new Promise((_, reject) =>
							setTimeout(
								() => reject(new Error("DB health check timeout")),
								1000,
							),
						),
					]);
					healthStatus.checks.database = "ok";
				}
			} catch (error) {
				healthStatus.checks.database = "error";
				healthStatus.status = "degraded";
				logger.warn("Database health check failed", { error });
			}

			// Return appropriate status code
			const statusCode = healthStatus.status === "healthy" ? 200 : 503;
			return c.json(healthStatus, statusCode);
		},
	)
	.use("/geo-info", ...publicMiddleware)
	.get(
		"/geo-info",
		describeRoute({
			tags: ["Health"],
			summary: "Geo information",
			description: "Returns geo information extracted from request headers",
			responses: {
				200: {
					description: "Geo information",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									ip: { type: "string", nullable: true },
									country: { type: "string", nullable: true },
									countryCode: { type: "string", nullable: true },
									region: { type: "string", nullable: true },
									regionCode: { type: "string", nullable: true },
									city: { type: "string", nullable: true },
									latitude: { type: "number", nullable: true },
									longitude: { type: "number", nullable: true },
									timezone: { type: "string", nullable: true },
									locale: { type: "string", nullable: true },
									continent: { type: "string", nullable: true },
									postalCode: { type: "string", nullable: true },
								},
							},
						},
					},
				},
			},
		}),
		(c) => {
			const geo = c.get("geo");
			return c.json(geo);
		},
	)
	.get(
		"/metrics",
		describeRoute({
			tags: ["Health"],
			summary: "Metrics",
			description:
				"Returns current metrics (only available in development mode)",
			responses: {
				200: {
					description: "Metrics data",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									requests: { type: "object" },
									errors: { type: "object" },
									latency: { type: "object" },
								},
							},
						},
					},
				},
				403: { description: "Forbidden - only available in development mode" },
			},
		}),
		(c) => {
			// Only expose metrics in development mode for security
			if (process.env.NODE_ENV === "production") {
				return c.json(
					{ error: "Metrics endpoint is only available in development mode" },
					403,
				);
			}

			const currentMetrics = metrics.getMetrics();
			return c.json(currentMetrics);
		},
	);
