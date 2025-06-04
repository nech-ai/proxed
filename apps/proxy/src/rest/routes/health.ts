import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { publicMiddleware } from "../middleware";
import type { Context } from "../types";
import { metrics } from "../../utils/metrics";

export const healthRouter = new Hono<Context>()
	.get(
		"/health",
		describeRoute({
			tags: ["Health"],
			summary: "Health check",
			description: "Returns 200 if the server is healthy",
			responses: { 200: { description: "OK" } },
		}),
		() => new Response("OK"),
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
