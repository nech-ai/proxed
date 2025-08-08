import { experimental_generateImage as generateImage, NoImageGeneratedError } from "ai";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { createAIClient } from "../../utils/ai-client";
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

// MARK: - Handle Image Generation
async function handleImageGeneration(c: Context<AppContext>) {
	const startTime = Date.now();

	// Validate project and get configuration
	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	// Validate request body
	const bodySchema = z
		.object({
			prompt: z.string().min(1, "Prompt is required"),
			model: z.string().optional(),
			size: z
				.string()
				.regex(/^\d+x\d+$/, {
					message: "Size must be in the format {width}x{height}",
				})
				.optional(),
			aspectRatio: z
				.string()
				.regex(/^\d+:\d+$/, {
					message: "Aspect ratio must be in the format {width}:{height}",
				})
				.optional(),
			n: z.number().int().min(1).max(20).optional(),
			seed: z.number().int().optional(),
			maxImagesPerCall: z.number().int().min(1).max(10).optional(),
			providerOptions: z
				.object({
					openai: z.record(z.any()).optional(),
					google: z.record(z.any()).optional(),
				})
				.optional(),
			headers: z.record(z.string()).optional(),
		})
		.refine((data) => !(data.size && data.aspectRatio), {
			message: "Specify either size or aspectRatio, not both",
			path: ["size"],
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
	} = await validateRequestBody(c, bodySchema);

	// Get full API key
	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);

	// Determine the model to use
	const modelToUse = requestedModel || project.model || getDefaultImageModel(project.key.provider);

	// Validate that the model supports image generation
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
				// size or aspectRatio
				...(size ? { size } : {}),
				...(aspectRatio ? { aspectRatio } : {}),
				n,
				...(seed !== undefined ? { seed } : {}),
				...(maxImagesPerCall !== undefined
					? { maxImagesPerCall }
					: {}),
				...(providerOptions ? { providerOptions } : {}),
				...(headers ? { headers } : {}),
			}),
			60000, // 60 second timeout for image generation
			"Image generation timed out after 60 seconds",
		);

		// Collect response
		const images = (gen.images ?? (gen.image ? [gen.image] : [])).map((img) => ({
			base64: img.base64,
			mediaType: (img as any).mediaType ?? "image/png",
		}));

		// Record successful execution (image generation does not provide token usage)
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
		);

		return c.json({
			images,
			warnings: gen.warnings,
			providerMetadata: gen.providerMetadata,
		});
	} catch (error) {
		logger.error("Image generation error:", {
			error: error instanceof Error ? error.message : error,
			projectId: project.id,
			teamId,
		});

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
			);

			throw createError(ErrorCode.PROVIDER_ERROR, (error as any).message, {
				originalError: (error as any).cause,
				projectId: project.id,
			});
		}

		// Record failed execution
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

export const imageGenerationRouter = new Hono<AppContext>()
	// ProjectId provided as header
	.use("/", ...protectedMiddleware)
	.post(
		"/",
		describeRoute({
			tags: ["Image Generation"],
			summary: "Image Generation",
			description: "Generates images from a text prompt using the projectId from header",
			responses: {
				200: { description: "Image generation response" },
				400: { description: "Bad request" },
				401: { description: "Unauthorized" },
				500: { description: "Internal server error" },
			},
		}),
		handleImageGeneration,
	)
	// ProjectId provided as part of the URL
	.use("/:projectId", ...protectedMiddleware)
	.post(
		"/:projectId",
		describeRoute({
			tags: ["Image Generation"],
			summary: "Image Generation with URL projectId",
			description: "Generates images from a text prompt using projectId from the URL",
			parameters: [
				{
					in: "path",
					name: "projectId",
					schema: { type: "string" },
					required: true,
					description: "The ID of the project",
				},
			],
			responses: {
				200: { description: "Image generation response" },
				400: { description: "Bad request" },
				401: { description: "Unauthorized" },
				500: { description: "Internal server error" },
			},
		}),
		handleImageGeneration,
	);