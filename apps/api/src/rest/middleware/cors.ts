import { getBaseUrl } from "@proxed/utils";
import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

const allowedOrigins = [getBaseUrl(), "https://app.proxed.ai"];
if (process.env.NODE_ENV !== "production") {
	allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
}

export const withCors: MiddlewareHandler = cors({
	origin: allowedOrigins,
	allowHeaders: [
		"Content-Type",
		"Authorization",
		"x-proxed-test-key",
		"x-ai-key",
		"x-project-id",
		"x-device-token",
	],
	allowMethods: ["POST", "GET"],
	exposeHeaders: ["Content-Length"],
	maxAge: 600,
	credentials: true,
});
