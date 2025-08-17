import { ZodParser, type JsonSchema } from "@proxed/structure";
import { generateObject, NoObjectGeneratedError } from "ai";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { createAIClient } from "../../utils/ai-client";
import { getVisionModel, supportsVision } from "../../utils/default-models";
import {
	validateAndGetProject,
	getFullApiKey,
	validateRequestBody,
	recordExecution,
	withTimeout,
} from "../../utils/route-handlers";

// MARK: - Handle Structured Response
async function handleStructuredResponse(c: Context<AppContext>) {
	const startTime = Date.now();

	// Validate project and get configuration
	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	// Validate request body
	const bodySchema = z.object({
		image: z.string().min(1, "Image is required"),
	});
	const { image } = await validateRequestBody(c, bodySchema);

	// Validate and parse schema
	const parser = new ZodParser();
	const schema = parser.convertJsonSchemaToZodValidator(
		project.schemaConfig as unknown as JsonSchema,
	);
	if (!schema) {
		throw createError(
			ErrorCode.VALIDATION_ERROR,
			"Invalid project schema configuration",
		);
	}

	// Get full API key
	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);

	// Determine the model to use
	const modelToUse = getVisionModel(
		project.key.provider,
		project.model || undefined,
	);

	// Validate that the model supports vision inputs
	if (!supportsVision(project.key.provider, modelToUse)) {
		throw createError(
			ErrorCode.VALIDATION_ERROR,
			`Model ${modelToUse} does not support vision inputs for provider ${project.key.provider}`,
		);
	}

	try {
		const aiClient = createAIClient(project.key.provider, fullApiKey);

		// Generate object with timeout
		const { object, usage, finishReason } = await withTimeout(
			generateObject({
				model: aiClient(modelToUse),
				schema,
				schemaName: (project.schemaConfig as any)?.title,
				schemaDescription: (project.schemaConfig as any)?.description,
				messages: [
					{
						role: "system",
						content:
							project.systemPrompt ||
							"You are a helpful assistant that analyzes images and returns structured data.",
					},
					{
						role: "user",
						content: [
							{
								type: "text",
								text:
									project.defaultUserPrompt ??
									"Analyze this image and extract information according to the schema.",
							},
							{
								type: "image",
								image: image,
							},
						],
					},
				],
				experimental_repairText: async ({ text, error }) => {
					// example: add a closing brace to the text
					if (error.message.includes("Unexpected end of JSON input")) {
						return `${text}}`;
					}
					return text;
				},
			}),
			30000, // 30 second timeout
			"Vision AI generation timed out after 30 seconds",
		);

		// Record successful execution
		await recordExecution(
			c,
			startTime,
			{
				promptTokens: usage.inputTokens || 0,
				completionTokens: usage.outputTokens || 0,
				totalTokens: usage.totalTokens || 0,
				finishReason: finishReason as FinishReason,
				response: object,
			},
			{ project, teamId },
		);

		return c.json(object);
	} catch (error) {
		logger.error(
			`Vision structured response error: ${error instanceof Error ? error.message : error}`,
		);

		if (NoObjectGeneratedError.isInstance(error)) {
			await recordExecution(
				c,
				startTime,
				{
					promptTokens: error.usage?.inputTokens || 0,
					completionTokens: error.usage?.outputTokens || 0,
					totalTokens: error.usage?.totalTokens || 0,
					finishReason: "error" as FinishReason,
					error: {
						message: error.message,
						code: error.name,
					},
					response: {
						text: error.text,
						cause: error.cause,
					},
				},
				{ project, teamId },
			);

			throw createError(ErrorCode.PROVIDER_ERROR, error.message, {
				originalError: error.cause,
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
			error instanceof Error
				? error.message
				: "Vision structured response failed",
			{
				originalError: error instanceof Error ? error.message : String(error),
				projectId: project.id,
			},
		);
	}
}

export const visionResponseRouter = new Hono<AppContext>()

	// ProjectId provided as header
	.use("/", ...protectedMiddleware)
	.post(
		"/",
		describeRoute({
			tags: ["Structured Response"],
			summary: "Structured Response",
			description: "Returns a structured response using projectId from header",
			responses: {
				200: { description: "Structured response" },
				400: { description: "Bad request" },
				401: { description: "Unauthorized" },
				500: { description: "Internal server error" },
			},
		}),
		handleStructuredResponse,
	)
	// ProjectId provided as part of the URL
	.use("/:projectId", ...protectedMiddleware)
	.post(
		"/:projectId",
		describeRoute({
			tags: ["Structured Response"],
			summary: "Structured Response with URL projectId",
			description: "Returns a structured response using projectId from the URL",
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
				200: { description: "Structured response" },
				400: { description: "Bad request" },
				401: { description: "Unauthorized" },
				500: { description: "Internal server error" },
			},
		}),
		handleStructuredResponse,
	);
