import { generateText, NoObjectGeneratedError } from "ai";
import type { Context } from "hono";
import { createRoute, OpenAPIHono, type RouteConfig } from "@hono/zod-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { createAIClient } from "../../utils/ai-client";
import { createStructuredOutput } from "../../utils/ai-output";
import { parseSchemaConfig } from "../../utils/schema-config";
import {
	getDefaultModel,
	supportsStructuredOutputs,
} from "../../utils/default-models";
import {
	validateAndGetProject,
	getFullApiKey,
	validateRequestBody,
	recordExecution,
	withTimeout,
} from "../../utils/route-handlers";
import { ZodParser } from "@proxed/structure";
import {
	authHeaderSchema,
	errorResponseSchema,
	projectIdHeaderSchema,
	projectIdParamSchema,
	structuredResponseSchema,
	structuredTextRequestSchema,
} from "../schemas";

async function handleStructuredResponse(c: Context<AppContext>) {
	const startTime = Date.now();

	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	const { text } = await validateRequestBody(c, structuredTextRequestSchema);

	const schemaConfig = parseSchemaConfig(project.schemaConfig);
	if (!schemaConfig) {
		throw createError(
			ErrorCode.VALIDATION_ERROR,
			"Invalid project schema configuration",
		);
	}

	const parser = new ZodParser();
	const schema = parser.convertJsonSchemaToZodValidator(schemaConfig.schema);
	if (!schema) {
		throw createError(
			ErrorCode.VALIDATION_ERROR,
			"Invalid project schema configuration",
		);
	}

	const fullApiKey = await getFullApiKey(db, project.keyId, apiKey!);
	const modelToUse = project.model || getDefaultModel(project.key.provider);

	if (!supportsStructuredOutputs(project.key.provider, modelToUse)) {
		throw createError(
			ErrorCode.VALIDATION_ERROR,
			`Model ${modelToUse} does not support structured outputs for provider ${project.key.provider}`,
		);
	}

	try {
		const aiClient = createAIClient(project.key.provider, fullApiKey);

		const structuredOutput = createStructuredOutput(
			schema,
			schemaConfig.title,
			schemaConfig.description,
		);

		const { output, totalUsage, finishReason } = await withTimeout(
			generateText({
				model: aiClient(modelToUse),
				output: structuredOutput,
				messages: [
					{
						role: "system",
						content:
							project.systemPrompt ||
							"You are a helpful assistant that returns structured data.",
					},
					{
						role: "user",
						content: [
							{
								type: "text",
								text: text,
							},
						],
					},
				],
			}),
			180000,
			"AI generation timed out after 180 seconds",
		);

		await recordExecution(
			c,
			startTime,
			{
				promptTokens: totalUsage.inputTokens || 0,
				completionTokens: totalUsage.outputTokens || 0,
				totalTokens: totalUsage.totalTokens || 0,
				finishReason: finishReason as FinishReason,
				response: output,
			},
			{ project, teamId },
		);

		return c.json(output, 200);
	} catch (error) {
		logger.error(
			`Text structured response error: ${error instanceof Error ? error.message : error}`,
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
				: "Text structured response failed",
			{
				originalError: error instanceof Error ? error.message : String(error),
				projectId: project.id,
			},
		);
	}
}

const structuredResponses: RouteConfig["responses"] = {
	200: {
		description: "Structured response payload.",
		content: { "application/json": { schema: structuredResponseSchema } },
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
		summary: "Text Structured Response",
		operationId: "structuredTextFromHeader",
		description:
			"Returns a structured response for text input using projectId from the x-project-id header.",
		tags: ["Structured Response"],
		security: [{ bearerAuth: [] }],
		request: {
			headers: authHeaderSchema.merge(projectIdHeaderSchema),
			body: {
				content: {
					"application/json": { schema: structuredTextRequestSchema },
				},
			},
		},
		responses: structuredResponses,
	}),
	handleStructuredResponse,
);

router.use("/:projectId", ...protectedMiddleware);

router.openapi(
	createRoute({
		method: "post",
		path: "/:projectId",
		summary: "Text Structured Response (projectId path)",
		operationId: "structuredTextFromPath",
		description:
			"Returns a structured response for text input using projectId from the URL path.",
		tags: ["Structured Response"],
		security: [{ bearerAuth: [] }],
		request: {
			params: projectIdParamSchema,
			headers: authHeaderSchema,
			body: {
				content: {
					"application/json": { schema: structuredTextRequestSchema },
				},
			},
		},
		responses: structuredResponses,
	}),
	handleStructuredResponse,
);

export { router as textResponseRouter };
