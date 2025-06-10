import { ZodParser, type JsonSchema } from "@proxed/structure";
import { generateObject } from "ai";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { createAIClient } from "../../utils/ai-client";
import {
	validateAndGetProject,
	getFullApiKey,
	validateRequestBody,
	recordExecution,
	withTimeout,
} from "../../utils/route-handlers";

async function handleStructuredResponse(c: Context<AppContext>) {
	const startTime = Date.now();

	// Validate project and get configuration
	const { project, teamId, apiKey, db } = await validateAndGetProject(c, {
		requireApiKey: true,
	});

	// Validate request body
	const bodySchema = z.object({
		pdf: z
			.string()
			.min(1, "PDF content is required")
			.refine(
				(pdf) => {
					// Check if it's a valid base64 PDF or URL
					const base64Regex = /^data:application\/pdf;base64,/;
					const urlRegex = /^https?:\/\/.+\.(pdf)$/i;
					return base64Regex.test(pdf) || urlRegex.test(pdf);
				},
				{
					message:
						"Invalid PDF format. Must be base64 data URI or valid PDF URL",
				},
			),
	});
	const { pdf } = await validateRequestBody(c, bodySchema);

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

	try {
		const aiClient = createAIClient(project.key.provider, fullApiKey);

		let pdfData: Buffer;
		if (pdf.startsWith("data:application/pdf;base64,")) {
			pdfData = Buffer.from(
				pdf.replace(/^data:application\/pdf;base64,/, ""),
				"base64",
			);
		} else {
			// If it's a URL, fetch the PDF with timeout
			const fetchWithTimeout = withTimeout(
				fetch(pdf),
				10000, // 10 second timeout for fetch
				"PDF fetch timed out",
			);

			const response = await fetchWithTimeout;
			if (!response.ok) {
				throw createError(
					ErrorCode.BAD_REQUEST,
					`Failed to fetch PDF from URL: ${response.statusText}`,
				);
			}

			const arrayBuffer = await response.arrayBuffer();
			pdfData = Buffer.from(arrayBuffer);
		}

		// Generate object with timeout
		const { object, usage, finishReason } = await withTimeout(
			generateObject({
				model: aiClient(project.model || "gpt-4o", { structuredOutputs: true }),
				schema,
				messages: [
					{
						role: "system",
						content:
							project.systemPrompt ||
							"You are a helpful assistant that analyzes PDF documents and returns structured data.",
					},
					{
						role: "user",
						content: [
							{
								type: "text",
								text:
									project.defaultUserPrompt ??
									"Analyze the following PDF and generate a structured response according to the schema.",
							},
							{
								type: "file",
								data: pdfData,
								mimeType: "application/pdf",
							},
						],
					},
				],
				maxTokens: 4000,
			}),
			60000, // 60 second timeout for PDF processing
			"PDF AI generation timed out after 60 seconds",
		);

		// Record successful execution
		await recordExecution(
			c,
			startTime,
			{
				promptTokens: usage.promptTokens,
				completionTokens: usage.completionTokens,
				totalTokens: usage.promptTokens + usage.completionTokens,
				finishReason: finishReason as FinishReason,
				response: object,
			},
			{ project, teamId },
		);

		return c.json(object);
	} catch (error) {
		logger.error("PDF structured response error:", {
			error: error instanceof Error ? error.message : error,
			projectId: project.id,
			teamId,
		});

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
			error instanceof Error ? error.message : "PDF structured response failed",
			{
				originalError: error instanceof Error ? error.message : String(error),
				projectId: project.id,
			},
		);
	}
}

export const pdfResponseRouter = new Hono<AppContext>()
	.use("/", ...protectedMiddleware)
	.post(
		"/",
		describeRoute({
			tags: ["Structured Response"],
			summary: "PDF Structured Response",
			description:
				"Returns a structured response for PDF input using projectId from header",
			responses: {
				200: { description: "Structured response" },
				400: { description: "Bad request" },
				401: { description: "Unauthorized" },
				500: { description: "Internal server error" },
			},
		}),
		handleStructuredResponse,
	)
	.use("/:projectId", ...protectedMiddleware)
	.post(
		"/:projectId",
		describeRoute({
			tags: ["Structured Response"],
			summary: "PDF Structured Response with URL projectId",
			description:
				"Returns a structured response for PDF input using projectId from the URL",
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
