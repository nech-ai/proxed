import { createRoute, OpenAPIHono, type RouteConfig } from "@hono/zod-openapi";
import type { Context as HonoContext } from "hono";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext } from "../types";
import {
	mapAnthropicFinishReason,
	type AnthropicResponse,
} from "../../utils/anthropic";
import { getProviderConfig } from "../../utils/provider-config";
import { handleProviderProxy } from "../../utils/provider-proxy";
import {
	authHeaderSchema,
	errorResponseSchema,
	proxyParamsSchema,
	proxyRequestSchema,
	proxyResponseSchema,
} from "../schemas";
import { getProxyPath, proxyMethods } from "./proxy-utils";

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

const proxyResponses: RouteConfig["responses"] = {
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
			summary: "Anthropic API Proxy",
			operationId: `anthropicProxy${method.toUpperCase()}`,
			description:
				"Proxies requests to the Anthropic API with authentication, tracking, and rate limiting. Supports streaming responses when the upstream API uses SSE.",
			tags: ["Anthropic Proxy"],
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
		}),
		async (c: HonoContext<AppContext>) => {
			const projectId = c.req.param("projectId");
			const proxyPath = getProxyPath(c.req.path, projectId);
			const config = getProviderConfig("ANTHROPIC");
			const targetUrl = `${config.baseUrl}/${proxyPath}`;
			return handleProviderProxy<AnthropicResponse>(c, targetUrl, {
				provider: "ANTHROPIC",
				providerSlug: "anthropic",
				providerLabel: "Anthropic",
				extractUsage: (response) => {
					const usage = response.usage ?? {};
					const promptTokens = usage.input_tokens ?? 0;
					const completionTokens = usage.output_tokens ?? 0;
					return {
						promptTokens,
						completionTokens,
						totalTokens: promptTokens + completionTokens,
					};
				},
				mapFinishReason: (response) =>
					mapAnthropicFinishReason(response.stop_reason),
			});
		},
	);

proxyMethods.forEach(registerProxyRoute);

export { router as anthropicRouter };
