import {
	experimental_generateImage as generateImage,
	NoImageGeneratedError,
} from "ai";
import type { Context } from "hono";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { createAIClient } from "../../utils/ai-client";
import {
	calculateImageGenerationCost,
	formatImageCostForDB,
} from "@proxed/utils/lib/pricing";
import {
	getDefaultImageModel,
	supportsImageGeneration,
} from "../../utils/default-models";
import {
	validateAndGetProject,
	getFullApiKey,
	validateRequestBody,
	recordExecution,
	withTimeout,
} from "../../utils/route-handlers";
import {
	authHeaderSchema,
	errorResponseSchema,
	imageGenerationRequestSchema,
	imageGenerationResponseSchema,
	projectIdHeaderSchema,
	projectIdParamSchema,
} from "../schemas";

async function handleImageGeneration(c: Context<AppContext>) {
	const startTime = Date.now();

	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	const {
		prompt,
		model: requestedModel,
		size,
		aspectRatio,
		n = 1,
		seed,
		maxImagesPerCall,
		providerOptions,
		headers,
	} = await validateRequestBody(c, imageGenerationRequestSchema);

	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);

	const modelToUse =
		requestedModel ||
		project.model ||
		getDefaultImageModel(project.key.provider);

	if (!supportsImageGeneration(project.key.provider, modelToUse)) {
		throw createError(
			ErrorCode.VALIDATION_ERROR,
			`Model ${modelToUse} does not support image generation for provider ${project.key.provider}`,
		);
	}

	try {
		const aiClient = createAIClient(project.key.provider, fullApiKey);

		const gen = await withTimeout(
			generateImage({
				model:
					project.key.provider === "GOOGLE"
						? (aiClient as any).image(modelToUse)
						: (aiClient as any).image(modelToUse),
				prompt,
				...(size ? { size: size as `${number}x${number}` } : {}),
				...(aspectRatio
					? { aspectRatio: aspectRatio as `${number}:${number}` }
					: {}),
				n,
				...(seed !== undefined ? { seed } : {}),
				...(maxImagesPerCall !== undefined ? { maxImagesPerCall } : {}),
				...(providerOptions ? { providerOptions: providerOptions as any } : {}),
				...(headers ? { headers: headers as Record<string, string> } : {}),
			}),
			60000,
			"Image generation timed out after 60 seconds",
		);

		const images = (gen.images ?? (gen.image ? [gen.image] : [])).map(
			(img) => ({
				base64: img.base64,
				mediaType: (img as any).mediaType ?? "image/png",
			}),
		);

		const quality =
			(providerOptions as any)?.openai?.quality ||
			(providerOptions as any)?.openai?.style ||
			(providerOptions as any)?.quality;
		const totalCostNumber = calculateImageGenerationCost({
			provider: project.key.provider,
			model: modelToUse,
			size,
			aspectRatio,
			quality,
			n,
		});
		const overrideCosts = formatImageCostForDB(totalCostNumber);

		await recordExecution(
			c,
			startTime,
			{
				promptTokens: 0,
				completionTokens: 0,
				totalTokens: 0,
				finishReason: "stop" as FinishReason,
				response: { imagesCount: images.length },
			},
			{ project, teamId },
			{ overrideCosts, overrideModel: modelToUse },
		);

		return c.json(
			{
				images,
				warnings: gen.warnings,
				providerMetadata: gen.providerMetadata,
			},
			200,
		);
	} catch (error) {
		logger.error(
			`Image generation error: ${error instanceof Error ? error.message : error}`,
		);

		if ((NoImageGeneratedError as any)?.isInstance?.(error)) {
			await recordExecution(
				c,
				startTime,
				{
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0,
					finishReason: "error" as FinishReason,
					error: {
						message: (error as any).message,
						code: (error as any).name,
					},
					response: {
						cause: (error as any).cause,
						responses: (error as any).responses,
					},
				},
				{ project, teamId },
				{ overrideModel: modelToUse },
			);

			throw createError(ErrorCode.PROVIDER_ERROR, (error as any).message, {
				originalError: (error as any).cause,
				projectId: project.id,
			});
		}

		await recordExecution(
			c,
			startTime,
			{
				promptTokens: 0,
				completionTokens: 0,
				totalTokens: 0,
				finishReason: "error" as FinishReason,
				error: {
					message: error instanceof Error ? error.message : "Unknown error",
					code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
				},
			},
			{ project, teamId },
			{ overrideModel: modelToUse },
		);

		throw createError(
			ErrorCode.PROVIDER_ERROR,
			error instanceof Error ? error.message : "Image generation failed",
			{
				originalError: error instanceof Error ? error.message : String(error),
				projectId: project.id,
			},
		);
	}
}

const imageResponses: Record<
	200 | 400 | 401 | 403 | 404 | 429 | 500,
	{
		description: string;
		content: {
			"application/json": { schema: any };
		};
	}
> = {
	200: {
		description: "Image generation response.",
		content: { "application/json": { schema: imageGenerationResponseSchema } },
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
};

const router = new OpenAPIHono<AppContext>();

router.use("/", ...protectedMiddleware);

router.openapi(
	createRoute({
		method: "post",
		path: "/",
		summary: "Image Generation",
		operationId: "imageGenerationFromHeader",
		description:
			"Generates images from a text prompt using the projectId from the x-project-id header.",
		tags: ["Image Generation"],
		security: [{ bearerAuth: [] }],
		request: {
			headers: authHeaderSchema.merge(projectIdHeaderSchema),
			body: {
				content: {
					"application/json": { schema: imageGenerationRequestSchema },
				},
			},
		},
		responses: imageResponses,
	}) as any,
	handleImageGeneration as any,
);

router.use("/:projectId", ...protectedMiddleware);

router.openapi(
	createRoute({
		method: "post",
		path: "/:projectId",
		summary: "Image Generation (projectId path)",
		operationId: "imageGenerationFromPath",
		description:
			"Generates images from a text prompt using projectId from the URL path.",
		tags: ["Image Generation"],
		security: [{ bearerAuth: [] }],
		request: {
			params: projectIdParamSchema,
			headers: authHeaderSchema,
			body: {
				content: {
					"application/json": { schema: imageGenerationRequestSchema },
				},
			},
		},
		responses: imageResponses,
	}) as any,
	handleImageGeneration as any,
);

export { router as imageGenerationRouter };
