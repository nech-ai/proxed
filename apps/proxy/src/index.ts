import { trpcServer } from "@hono/trpc-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { Context } from "./rest/types";
import { createTRPCContext } from "./trpc/init";
import { appRouter } from "./trpc/routers/_app";
import { checkHealth } from "./utils/health";

const app = new OpenAPIHono<Context>();

app.use(secureHeaders());

app.use(
	"/trpc/*",
	cors({
		origin: process.env.ALLOWED_API_ORIGINS?.split(",") ?? [],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowHeaders: [
			"Authorization",
			"Content-Type",
			"accept-language",
			"x-trpc-source",
			"x-user-locale",
			"x-user-timezone",
			"x-user-country",
		],
		exposeHeaders: ["Content-Length"],
		maxAge: 86400,
	}),
);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: createTRPCContext,
	}),
);

app.get("/health", async (c) => {
	try {
		await checkHealth();

		return c.json({ status: "ok" }, 200);
	} catch (error) {
		return c.json({ status: "error" }, 500);
	}
});

export default {
	port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
	fetch: app.fetch,
};
