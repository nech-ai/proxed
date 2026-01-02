import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context as HonoContext } from "hono";
import { openaiRouter } from "./routes/openai";
import { anthropicRouter } from "./routes/anthropic";
import { googleRouter } from "./routes/google";
import { visionResponseRouter } from "./routes/vision";
import { textResponseRouter } from "./routes/text";
import { pdfResponseRouter } from "./routes/pdf";
import { healthRouter } from "./routes/health";
import type { Context as AppContext } from "./types";
import { imageGenerationRouter } from "./routes/image";
import {
	getModelDisplayName,
	getModelsForProvider,
} from "@proxed/utils/lib/providers";
import { getModelPricing } from "@proxed/utils/lib/pricing";
import { publicMiddleware } from "./middleware";
import { createError, ErrorCode } from "../utils/errors";
import { getProjectQuery } from "@proxed/db/queries";

const routers = new OpenAPIHono<AppContext>();

// Remove global middleware - it's already applied in individual routers
// routers.use("/*", ...protectedMiddleware);

// Route definitions
routers.route("/v1/openai", openaiRouter);
routers.route("/v1/anthropic", anthropicRouter);
routers.route("/v1/google", googleRouter);
routers.route("/v1/vision", visionResponseRouter);
routers.route("/v1/text", textResponseRouter);
routers.route("/v1/pdf", pdfResponseRouter);
routers.route("/v1/image", imageGenerationRouter);

// Health check doesn't need authentication
const publicRouters = new OpenAPIHono<AppContext>();
publicRouters.route("/", healthRouter);

const uuidRegex =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const buildOpenAIModelsResponse = () => {
	const models = getModelsForProvider("OPENAI");
	return {
		object: "list",
		data: models.map((model) => ({
			id: model,
			object: "model",
			created: 0,
			owned_by: "openai",
			display_name: getModelDisplayName(model),
			pricing: getModelPricing("OPENAI", model),
		})),
	};
};

const buildAnthropicModelsResponse = () => {
	const models = getModelsForProvider("ANTHROPIC");
	return {
		data: models.map((model) => ({
			id: model,
			type: "model",
			created_at: new Date(0).toISOString(),
			display_name: getModelDisplayName(model),
			pricing: getModelPricing("ANTHROPIC", model),
		})),
		has_more: false,
		first_id: models[0] ?? null,
		last_id: models[models.length - 1] ?? null,
	};
};

const buildGoogleModelsResponse = () => {
	const models = getModelsForProvider("GOOGLE");
	return {
		models: models.map((model) => ({
			name: `models/${model}`,
			displayName: getModelDisplayName(model),
			pricing: getModelPricing("GOOGLE", model),
		})),
	};
};

const assertProjectExists = async (c: HonoContext<AppContext>) => {
	const projectId = c.req.param("projectId");
	if (!projectId) {
		throw createError(ErrorCode.MISSING_PROJECT_ID, "Project ID is required");
	}
	if (!uuidRegex.test(projectId)) {
		throw createError(ErrorCode.BAD_REQUEST, "Invalid project ID format");
	}
	const db = c.get("db");
	if (!db) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Database connection not available",
		);
	}
	const project = await getProjectQuery(db, projectId);
	if (!project) {
		throw createError(ErrorCode.PROJECT_NOT_FOUND);
	}
};

publicRouters.use("/v1/:provider/:projectId/models", ...publicMiddleware);

publicRouters.get("/v1/openai/models", (c) => {
	return c.json(buildOpenAIModelsResponse(), 200);
});

publicRouters.get("/v1/openai/:projectId/models", async (c) => {
	await assertProjectExists(c);
	return c.json(buildOpenAIModelsResponse(), 200);
});

publicRouters.get("/v1/anthropic/models", (c) => {
	return c.json(buildAnthropicModelsResponse(), 200);
});

publicRouters.get("/v1/anthropic/:projectId/models", async (c) => {
	await assertProjectExists(c);
	return c.json(buildAnthropicModelsResponse(), 200);
});

publicRouters.get("/v1/google/models", (c) => {
	return c.json(buildGoogleModelsResponse(), 200);
});

publicRouters.get("/v1/google/:projectId/models", async (c) => {
	await assertProjectExists(c);
	return c.json(buildGoogleModelsResponse(), 200);
});

export { routers, publicRouters };
