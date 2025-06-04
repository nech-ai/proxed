import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { publicMiddleware } from "../middleware";
import type { Context } from "../types";

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
	);
