import { OpenAPIHono } from "@hono/zod-openapi";
import { openaiRouter } from "./routes/openai";
import { anthropicRouter } from "./routes/anthropic";
import { visionResponseRouter } from "./routes/vision";
import { textResponseRouter } from "./routes/text";
import { pdfResponseRouter } from "./routes/pdf";
import { healthRouter } from "./routes/health";
import type { Context } from "./types";

const routers = new OpenAPIHono<Context>();

// Remove global middleware - it's already applied in individual routers
// routers.use("/*", ...protectedMiddleware);

// Route definitions
routers.route("/v1/openai", openaiRouter);
routers.route("/v1/anthropic", anthropicRouter);
routers.route("/v1/vision", visionResponseRouter);
routers.route("/v1/text", textResponseRouter);
routers.route("/v1/pdf", pdfResponseRouter);

// Health check doesn't need authentication
const publicRouters = new OpenAPIHono<Context>();
publicRouters.route("/", healthRouter);

export { routers, publicRouters };
