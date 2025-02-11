import { createOpenAI } from "@ai-sdk/openai";
import { ZodParser, type JsonSchema } from "@proxed/structure";
import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createExecution } from "@proxed/supabase/mutations";
import { generateObject } from "ai";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../middleware/auth";
import type { AuthMiddlewareVariables } from "../types";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";
import { z } from "zod";
import { logger } from "@proxed/logger";

// MARK: - Handle Structured Response
async function handleStructuredResponse(
	c: Context<{ Variables: AuthMiddlewareVariables }>,
) {
	const { projectId, teamId } = c.get("session");
	const ip =
		c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip");
	const userAgent = c.req.header("user-agent");

	const supabase = createClient();
	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error || !project || !project.key) {
		return c.json({ error: "Project not found" }, 404);
	}

	// Validate the request body: check content-type, safely parse JSON, and validate with zod
	const contentType = c.req.header("content-type");
	if (!contentType || !contentType.includes("application/json")) {
		return c.json({ error: "Invalid content type" }, 400);
	}

	let bodyData: unknown;
	try {
		bodyData = await c.req.json();
	} catch (err) {
		return c.json({ error: "Invalid JSON payload" }, 400);
	}

	const bodySchema = z.object({
		image: z.string().nonempty("Image is required"),
	});
	const result = bodySchema.safeParse(bodyData);
	if (!result.success) {
		return c.json({ error: result.error.flatten() }, 400);
	}
	const { image } = result.data;

	// Convert project schema config using jsonToZod
	const parser = new ZodParser();
	const schema = parser.convertJsonSchemaToZodValidator(
		project.schema_config as unknown as JsonSchema,
	);
	if (!schema) {
		return c.json({ error: "Invalid schema" }, 400);
	}

	const deviceCheckId = project.device_check_id;
	const keyId = project.key_id;

	const apiKey = c.req.header("x-ai-key");

	const startTime = Date.now();
	try {
		const openaiClient = createOpenAI({
			apiKey: reassembleKey(project.key.partial_key_server, apiKey),
		});

		const { object, usage, finishReason } = await generateObject({
			model: openaiClient(project.model, { structuredOutputs: true }),
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
							text:
								project.default_user_prompt ?? "You are a helpful assistant.",
						},
						{
							type: "image",
							image: image,
						},
					],
				},
			],
			maxTokens: 1000,
		});

		const latency = Date.now() - startTime;

		// Create execution record
		await createExecution(supabase, {
			team_id: teamId,
			project_id: projectId,
			device_check_id: deviceCheckId,
			key_id: keyId,
			ip,
			user_agent: userAgent ?? undefined,
			model: project.model,
			provider: project.key.provider,
			prompt_tokens: usage.promptTokens,
			completion_tokens: usage.completionTokens,
			finish_reason: finishReason,
			latency,
			response_code: 200,
			response: JSON.stringify(object),
		});

		return c.json(object);
	} catch (error) {
		logger.error("Structured response error:", error);
		const latency = Date.now() - startTime;

		// Create execution record for error case
		await createExecution(supabase, {
			team_id: teamId,
			project_id: projectId,
			device_check_id: deviceCheckId,
			key_id: keyId,
			ip,
			user_agent: userAgent ?? undefined,
			model: project.model,
			provider: project.key.provider,
			prompt_tokens: 0,
			completion_tokens: 0,
			finish_reason: "error",
			latency,
			response_code: 500,
			error_message: error instanceof Error ? error.message : "Unknown error",
			error_code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
		});

		return c.json({ error: (error as Error).message }, 500);
	}
}

export const structuredResponseRouter = new Hono<{
	Variables: AuthMiddlewareVariables;
}>()

	// ProjectId provided as header
	.use("/", authMiddleware)
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
	.use("/:projectId", authMiddleware)
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
