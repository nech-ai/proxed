import { generateImage, NoImageGeneratedError } from "ai";
import { isJSONValue, type JSONObject } from "@ai-sdk/provider";
import type { ProviderOptions } from "@ai-sdk/provider-utils";
import type { Context } from "hono";
import { createRoute, OpenAPIHono, type RouteConfig } from "@hono/zod-openapi";
import { inArray } from "drizzle-orm";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { createAIClient } from "../../utils/ai-client";
import type { z } from "zod";
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
import { createAdminClient } from "../../services/supabase";
import { vaultObjects } from "@proxed/db/schema";
import {
	authHeaderSchema,
	errorResponseSchema,
	imageGenerationRequestSchema,
	imageGenerationResponseSchema,
	projectIdHeaderSchema,
	projectIdParamSchema,
} from "../schemas";

type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>;
type ProviderOptionsInput = ImageGenerationRequest["providerOptions"];
type ImageSize = `${number}x${number}`;
type ImageAspectRatio = `${number}:${number}`;

function isImageSize(value: string): value is ImageSize {
	return /^\d+x\d+$/.test(value);
}

function isImageAspectRatio(value: string): value is ImageAspectRatio {
	return /^\d+:\d+$/.test(value);
}

function isJsonObject(value: Record<string, unknown>): value is JSONObject {
	return Object.values(value).every(isJSONValue);
}

function buildProviderOptions(
	options: ProviderOptionsInput,
): ProviderOptions | undefined {
	if (!options) {
		return undefined;
	}

	const providerOptions: ProviderOptions = {};

	if (options.openai && isJsonObject(options.openai)) {
		providerOptions.openai = options.openai;
	}

	if (options.google && isJsonObject(options.google)) {
		providerOptions.google = options.google;
	}

	return Object.keys(providerOptions).length > 0 ? providerOptions : undefined;
}

function getOpenAIImageQuality(
	options: ProviderOptionsInput,
): string | undefined {
	const openaiOptions = options?.openai;
	if (!openaiOptions) {
		return undefined;
	}

	const quality = openaiOptions.quality;
	if (typeof quality === "string") {
		return quality;
	}

	const style = openaiOptions.style;
	if (typeof style === "string") {
		return style;
	}

	return undefined;
}

function parseBase64Image(base64: string) {
	const dataUriMatch = base64.match(/^data:(.+);base64,(.*)$/);
	if (dataUriMatch) {
		return {
			mediaType: dataUriMatch[1],
			base64: dataUriMatch[2],
		};
	}
	return { base64 };
}

function getExtensionForMediaType(mediaType: string) {
	switch (mediaType) {
		case "image/jpeg":
			return "jpg";
		case "image/webp":
			return "webp";
		case "image/png":
			return "png";
		default:
			return "png";
	}
}

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
		providerOptions: rawProviderOptions,
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
		const aiClient =
			project.key.provider === "OPENAI"
				? createAIClient("OPENAI", fullApiKey)
				: project.key.provider === "GOOGLE"
					? createAIClient("GOOGLE", fullApiKey)
					: null;

		if (!aiClient) {
			throw createError(
				ErrorCode.VALIDATION_ERROR,
				`Provider ${project.key.provider} does not support image generation`,
			);
		}

		const providerOptions = buildProviderOptions(rawProviderOptions);
		const imageModel = aiClient.image(modelToUse);

		const gen = await withTimeout(
			generateImage({
				model: imageModel,
				prompt,
				...(size && isImageSize(size) ? { size } : {}),
				...(aspectRatio && isImageAspectRatio(aspectRatio)
					? { aspectRatio }
					: {}),
				n,
				...(seed !== undefined ? { seed } : {}),
				...(maxImagesPerCall !== undefined ? { maxImagesPerCall } : {}),
				...(providerOptions ? { providerOptions } : {}),
				...(headers ? { headers } : {}),
			}),
			180000,
			"Image generation timed out after 180 seconds",
		);

		const generatedImages = gen.images.length > 0 ? gen.images : [gen.image];
		const vaultWarnings: string[] = [];
		const savedItems: Array<{
			index: number;
			path: string;
			mediaType: string;
			url?: string | null;
		}> = [];
		let vaultItems: Array<{ id: string; path: string; mediaType: string }> = [];

		if (project.saveImagesToVault) {
			const supabase = createAdminClient();
			const now = new Date();
			const datePath = [
				now.getUTCFullYear().toString(),
				String(now.getUTCMonth() + 1).padStart(2, "0"),
				String(now.getUTCDate()).padStart(2, "0"),
			];
			const basePath = [teamId, "generated-images", project.id, ...datePath];
			const rowsToInsert: Array<typeof vaultObjects.$inferInsert> = [];

			for (const [index, img] of generatedImages.entries()) {
				try {
					const parsed = parseBase64Image(img.base64);
					const mediaType = img.mediaType || parsed.mediaType || "image/png";
					const extension = getExtensionForMediaType(mediaType);
					const filename = `${crypto.randomUUID()}.${extension}`;
					const pathTokens = [...basePath, filename];
					const path = pathTokens.join("/");
					const buffer = Buffer.from(parsed.base64, "base64");

					const uploadResult = await supabase.storage
						.from("vault")
						.upload(path, buffer, {
							contentType: mediaType,
							cacheControl: "3600",
							upsert: false,
						});

					if (uploadResult.error) {
						vaultWarnings.push(
							`Failed to save generated image ${index + 1} to vault.`,
						);
						continue;
					}

					const { data: signed } = await supabase.storage
						.from("vault")
						.createSignedUrl(path, 600);

					rowsToInsert.push({
						teamId,
						projectId: project.id,
						bucket: "vault",
						pathTokens,
						mimeType: mediaType,
						sizeBytes: buffer.byteLength,
					});

					savedItems.push({
						index,
						path,
						mediaType,
						url: signed?.signedUrl ?? null,
					});
				} catch (error) {
					logger.error(
						`Failed to save generated image to vault: ${
							error instanceof Error ? error.message : error
						}`,
					);
					vaultWarnings.push(
						`Failed to save generated image ${index + 1} to vault.`,
					);
				}
			}

			if (rowsToInsert.length > 0) {
				try {
					const inserted = await db
						.insert(vaultObjects)
						.values(rowsToInsert)
						.returning();
					const insertedByPath = new Map(
						inserted.map((row) => [row.pathTokens.join("/"), row]),
					);

					vaultItems = savedItems
						.map((item) => {
							const row = insertedByPath.get(item.path);
							if (!row) return null;
							return {
								id: row.id,
								path: item.path,
								mediaType: item.mediaType,
							};
						})
						.filter(
							(item): item is { id: string; path: string; mediaType: string } =>
								!!item,
						);
				} catch (error) {
					logger.error(
						`Failed to record vault items: ${
							error instanceof Error ? error.message : error
						}`,
					);
					vaultWarnings.push(
						"Failed to register saved images in the vault. Images were not stored.",
					);
					try {
						await supabase.storage
							.from("vault")
							.remove(savedItems.map((item) => item.path));
					} catch (cleanupError) {
						logger.error(
							`Failed to clean up vault uploads: ${
								cleanupError instanceof Error
									? cleanupError.message
									: cleanupError
							}`,
						);
					}
					savedItems.length = 0;
				}
			}
		}

		const savedByIndex = new Map(savedItems.map((item) => [item.index, item]));
		const images = generatedImages.map((img, index) => {
			const saved = savedByIndex.get(index);
			return {
				base64: img.base64,
				mediaType: img.mediaType,
				...(saved?.url ? { url: saved.url } : {}),
				...(saved?.path ? { path: saved.path } : {}),
			};
		});

		const usage = gen.usage;
		const promptTokens = usage?.inputTokens ?? 0;
		const completionTokens = usage?.outputTokens ?? 0;
		const totalTokens = usage?.totalTokens ?? promptTokens + completionTokens;

		const quality = getOpenAIImageQuality(rawProviderOptions);
		const totalCostNumber = calculateImageGenerationCost({
			provider: project.key.provider,
			model: modelToUse,
			size,
			aspectRatio,
			quality,
			n,
		});
		const overrideCosts = formatImageCostForDB(totalCostNumber);

		const executionId = await recordExecution(
			c,
			startTime,
			{
				promptTokens,
				completionTokens,
				totalTokens,
				finishReason: "stop",
				response: {
					imagesCount: images.length,
					...(vaultItems.length > 0 ? { vault: { items: vaultItems } } : {}),
				},
			},
			{ project, teamId },
			{ overrideCosts, overrideModel: modelToUse },
		);

		if (executionId && vaultItems.length > 0) {
			try {
				await db
					.update(vaultObjects)
					.set({ executionId })
					.where(inArray(vaultObjects.id, vaultItems.map((item) => item.id)));
			} catch (error) {
				logger.error(
					`Failed to link vault items to execution: ${
						error instanceof Error ? error.message : error
					}`,
				);
			}
		}

		const warnings = [...(gen.warnings ?? []), ...vaultWarnings];

		return c.json(
			{
				images,
				warnings: warnings.length > 0 ? warnings : undefined,
				providerMetadata: gen.providerMetadata,
			},
			200,
		);
	} catch (error) {
		logger.error(
			`Image generation error: ${error instanceof Error ? error.message : error}`,
		);

		if (NoImageGeneratedError.isInstance(error)) {
			await recordExecution(
				c,
				startTime,
				{
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0,
					finishReason: "error",
					error: {
						message: error.message,
						code: error.name,
					},
					response: {
						cause: error.cause,
						responses: error.responses,
					},
				},
				{ project, teamId },
				{ overrideModel: modelToUse },
			);

			throw createError(ErrorCode.PROVIDER_ERROR, error.message, {
				originalError: error.cause,
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
				finishReason: "error",
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

const imageResponses: RouteConfig["responses"] = {
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
	}),
	handleImageGeneration,
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
	}),
	handleImageGeneration,
);

export { router as imageGenerationRouter };
