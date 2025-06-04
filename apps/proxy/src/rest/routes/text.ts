import { ZodParser, type JsonSchema } from "@proxed/structure";
import { getProjectQuery } from "../../db/queries/projects";
import { createExecution } from "../../db/queries/executions";
import { getServerKey } from "../../db/queries/server-keys";
import { generateObject } from "ai";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { protectedMiddleware } from "../middleware";
import type { Context as AppContext, FinishReason } from "../types";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { createError, ErrorCode } from "../../utils/errors";
import { getCommonExecutionParams } from "../../utils/execution-params";
import { createAIClient } from "../../utils/ai-client";
import { checkAndNotifyRateLimit } from "../../utils/rate-limit";

async function handleStructuredResponse(c: Context<AppContext>) {
	const { projectId, teamId, apiKey } = c.get("session");
	const db = c.get("db");
	const geo = c.get("geo");
	const userAgent = c.req.header("user-agent");

	const project = await getProjectQuery(db, projectId);

	if (!project || !project.key) {
		throw createError(ErrorCode.PROJECT_NOT_FOUND);
	}

	const contentType = c.req.header("content-type");
	if (!contentType || !contentType.includes("application/json")) {
		throw createError(ErrorCode.BAD_REQUEST, "Invalid content type");
	}

	let bodyData: unknown;
	try {
		bodyData = await c.req.json();
	} catch (err) {
		throw createError(ErrorCode.BAD_REQUEST, "Invalid JSON payload");
	}

	const bodySchema = z.object({
		text: z.string().nonempty("Text input is required"),
	});
	const result = bodySchema.safeParse(bodyData);
	if (!result.success) {
		throw createError(ErrorCode.VALIDATION_ERROR, "Validation failed", {
			details: result.error.flatten(),
		});
	}
	const { text } = result.data;

	const parser = new ZodParser();
	const schema = parser.convertJsonSchemaToZodValidator(
		project.schemaConfig as unknown as JsonSchema,
	);
	if (!schema) {
		throw createError(ErrorCode.VALIDATION_ERROR, "Invalid schema");
	}

	const deviceCheckId = project.deviceCheckId;
	const keyId = project.keyId;

	if (!apiKey) {
		throw createError(ErrorCode.INTERNAL_ERROR, "API key not found in session");
	}

	const startTime = Date.now();

	// Get the server key part using the function
	const serverKey = await getServerKey(db, project.keyId);

	if (!serverKey) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Failed to retrieve server key",
		);
	}

	const [fullApiKey] = reassembleKey(serverKey, apiKey).split(".");

	const commonParams = getCommonExecutionParams({
		teamId,
		projectId,
		deviceCheckId,
		keyId,
		ip: geo.ip ?? undefined,
		userAgent,
		model: project.model,
		provider: project.key.provider,
		geo,
	});

	try {
		const aiClient = createAIClient(project.key.provider, fullApiKey);

		const { object, usage, finishReason } = await generateObject({
			model: aiClient(project.model, { structuredOutputs: true }),
			schema,
			messages: [
				{
					role: "system",
					content: project.systemPrompt,
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
			maxTokens: 1000,
		});

		const latency = Date.now() - startTime;

		await createExecution(db, {
			...commonParams,
			promptTokens: usage.promptTokens,
			completionTokens: usage.completionTokens,
			totalTokens: usage.promptTokens + usage.completionTokens,
			finishReason: finishReason as FinishReason,
			latency,
			responseCode: 200,
			response: JSON.stringify(object),
		});

		// Non-blocking: Check rate limit and trigger notification job
		checkAndNotifyRateLimit({
			c,
			db,
			projectId,
			teamId,
			projectName: project.name,
		});

		return c.json(object);
	} catch (error) {
		logger.error("Structured response error:", error);
		const latency = Date.now() - startTime;

		await createExecution(db, {
			...commonParams,
			promptTokens: 0,
			completionTokens: 0,
			totalTokens: 0,
			finishReason: "error" as FinishReason,
			latency,
			responseCode: 500,
			errorMessage: error instanceof Error ? error.message : "Unknown error",
			errorCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
		});

		throw createError(
			ErrorCode.PROVIDER_ERROR,
			error instanceof Error ? error.message : "Structured response failed",
			{
				originalError: error instanceof Error ? error.message : "Unknown error",
			},
		);
	}
}

export const textResponseRouter = new Hono<AppContext>()
	.use("/", ...protectedMiddleware)
	.post(
		"/",
		describeRoute({
			tags: ["Structured Response"],
			summary: "Text Structured Response",
			description:
				"Returns a structured response for text input using projectId from header",
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
			summary: "Text Structured Response with URL projectId",
			description:
				"Returns a structured response for text input using projectId from the URL",
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
