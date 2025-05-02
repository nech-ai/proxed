import { createOpenAI } from "@ai-sdk/openai";
import { ZodParser, type JsonSchema } from "@proxed/structure";
import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createExecution } from "@proxed/supabase/mutations";
import { generateObject } from "ai";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../middleware/auth";
import type { AuthMiddlewareVariables, FinishReason } from "../types";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";
import { z } from "zod";
import { logger } from "@proxed/logger";
import { createError, ErrorCode } from "../utils/errors";
import { getCommonExecutionParams } from "../utils/execution-params";
import { createAIClient } from "../utils/ai-client";
import { checkAndNotifyRateLimit } from "../utils/rate-limit";

async function handleStructuredResponse(
	c: Context<{ Variables: AuthMiddlewareVariables }>,
) {
	const { projectId, teamId, apiKey } = c.get("session");
	const ip =
		c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip");
	const userAgent = c.req.header("user-agent");

	const supabase = createClient();
	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error || !project || !project.key) {
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
		project.schema_config as unknown as JsonSchema,
	);
	if (!schema) {
		throw createError(ErrorCode.VALIDATION_ERROR, "Invalid schema");
	}

	const deviceCheckId = project.device_check_id;
	const keyId = project.key_id;

	if (!apiKey) {
		throw createError(ErrorCode.INTERNAL_ERROR, "API key not found in session");
	}

	const startTime = Date.now();

	// Get the server key part using the function
	const { data: serverKey, error: serverKeyError } = await supabase.rpc(
		"get_server_key",
		{
			p_provider_key_id: project.key_id,
		},
	);

	if (serverKeyError || !serverKey) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Failed to retrieve server key",
			{
				error: serverKeyError?.message,
			},
		);
	}

	const [fullApiKey] = reassembleKey(serverKey, apiKey).split(".");

	const commonParams = getCommonExecutionParams({
		teamId,
		projectId,
		deviceCheckId,
		keyId,
		ip,
		userAgent,
		model: project.model,
		provider: project.key.provider,
		c,
	});

	try {
		const aiClient = createAIClient(project.key.provider, fullApiKey);

		const { object, usage, finishReason } = await generateObject({
			model: aiClient(project.model, { structuredOutputs: true }),
			schema,
			messages: [
				{
					role: "system",
					content: project.system_prompt,
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

		await createExecution(supabase, {
			...commonParams,
			prompt_tokens: usage.promptTokens,
			completion_tokens: usage.completionTokens,
			finish_reason: finishReason as FinishReason,
			latency,
			response_code: 200,
			response: JSON.stringify(object),
		});

		// Non-blocking: Check rate limit and trigger notification job
		checkAndNotifyRateLimit({
			c,
			supabase,
			projectId,
			teamId,
			projectName: project.name,
			timeWindowSeconds: 300,
			callThreshold: 10,
		});

		return c.json(object);
	} catch (error) {
		logger.error("Structured response error:", error);
		const latency = Date.now() - startTime;

		await createExecution(supabase, {
			...commonParams,
			prompt_tokens: 0,
			completion_tokens: 0,
			finish_reason: "error" as FinishReason,
			latency,
			response_code: 500,
			error_message: error instanceof Error ? error.message : "Unknown error",
			error_code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
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

export const textResponseRouter = new Hono<{
	Variables: AuthMiddlewareVariables;
}>()
	.use("/", authMiddleware)
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
	.use("/:projectId", authMiddleware)
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
