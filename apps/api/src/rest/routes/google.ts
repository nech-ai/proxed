import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import type { Context as HonoContext } from "hono";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext } from "../types";
import { mapGoogleFinishReason, type GoogleResponse } from "../../utils/google";
import { getProviderConfig } from "../../utils/provider-config";
import { handleProviderProxy } from "../../utils/provider-proxy";
import {
	authHeaderSchema,
	errorResponseSchema,
	proxyParamsSchema,
	proxyRequestSchema,
	proxyResponseSchema,
} from "../schemas";
import { proxyMethods } from "./proxy-utils";

const router = new OpenAPIHono<AppContext>();

router.use("/:projectId/*", ...protectedMiddleware);

const proxyResponseHeaders = {
	"X-Proxed-Retries": {
		description: "Number of retry attempts for the upstream request.",
		schema: { type: "string" as const },
	},
	"X-Proxed-Latency": {
		description: "Upstream request latency in milliseconds.",
		schema: { type: "string" as const },
	},
	"x-request-id": {
		description: "Request identifier for tracing.",
		schema: { type: "string" as const },
	},
};

const proxyResponses: Record<
	200 | 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503,
	{
		description: string;
		headers?: typeof proxyResponseHeaders;
		content: {
			"application/json": { schema: any };
		};
	}
> = {
	200: {
		description: "Successful proxy response (pass-through).",
		headers: proxyResponseHeaders,
		content: {
			"application/json": { schema: proxyResponseSchema },
		},
	},
	400: {
		description: "Bad request.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
	401: {
		description: "Unauthorized.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
	403: {
		description: "Forbidden.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
	404: {
		description: "Not found.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
	429: {
		description: "Too many requests.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
	500: {
		description: "Internal server error.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
	502: {
		description: "Upstream provider error.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
	503: {
		description: "Service unavailable.",
		content: { "application/json": { schema: errorResponseSchema } },
	},
};

const registerProxyRoute = (method: (typeof proxyMethods)[number]) =>
	router.openapi(
		createRoute({
			method,
			path: "/:projectId/*",
			summary: "Google AI API Proxy",
			operationId: `googleProxy${method.toUpperCase()}`,
			description:
				"Proxies requests to the Google AI (Gemini) API with authentication, tracking, and rate limiting. Supports streaming responses when the upstream API uses SSE.",
			tags: ["Google AI Proxy"],
			security: [{ bearerAuth: [] }],
			request: {
				params: proxyParamsSchema,
				headers: authHeaderSchema,
				body: {
					content: {
						"application/json": { schema: proxyRequestSchema },
						"application/x-www-form-urlencoded": {
							schema: proxyRequestSchema,
						},
						"multipart/form-data": { schema: proxyRequestSchema },
						"text/plain": { schema: proxyRequestSchema },
					},
				},
			},
			responses: proxyResponses,
		}) as any,
		(async (c: HonoContext<AppContext>) => {
			const proxyPath = c.req.path.split(`/${c.req.param("projectId")}/`)[1];
			const config = getProviderConfig("GOOGLE");
			const targetUrl = `${config.baseUrl}/${proxyPath}`;
			return handleProviderProxy<GoogleResponse>(c, targetUrl, {
				provider: "GOOGLE",
				providerSlug: "google",
				providerLabel: "Google AI",
				extractUsage: (response) => {
					const usage = response.usageMetadata ?? {
						promptTokenCount: 0,
						candidatesTokenCount: 0,
						totalTokenCount: 0,
					};
					return {
						promptTokens: usage.promptTokenCount ?? 0,
						completionTokens: usage.candidatesTokenCount ?? 0,
						totalTokens: usage.totalTokenCount ?? 0,
					};
				},
				mapFinishReason: (response) =>
					mapGoogleFinishReason(response.candidates?.[0]?.finishReason),
			});
		}) as any,
	);

proxyMethods.forEach(registerProxyRoute);

export { router as googleRouter };
