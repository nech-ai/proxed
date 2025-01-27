import { openai } from "@ai-sdk/openai";
import { type JsonSchema, jsonToZod } from "@proxed/structure";
import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createExecution } from "@proxed/supabase/mutations";
import { generateObject } from "ai";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../middleware/auth";
import type { AuthMiddlewareVariables } from "../types";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";

export const structuredResponseRouter = new Hono<{
	Variables: AuthMiddlewareVariables;
}>()
	.use(authMiddleware)
	.post(
		"/",
		describeRoute({
			tags: ["Structured Response"],
			summary: "Structured Response",
			description: "Returns a structured response",
			responses: {
				200: { description: "Plant analysis result" },
				400: { description: "Bad request" },
				401: { description: "Unauthorized" },
				500: { description: "Internal server error" },
			},
		}),
		async (c) => {
			const { projectId, teamId } = c.get("session");
			const ip =
				c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip");
			const userAgent = c.req.header("user-agent");

			const supabase = createClient();
			const { data: project, error } = await getProjectQuery(
				supabase,
				projectId,
			);

			if (error || !project || !project.key) {
				return c.json({ error: "Project not found" }, 404);
			}

			const deviceCheckId = project.device_check_id;
			const keyId = project.key_id;

			const apiKey = c.req.header("X-Ai-Token");

			try {
				const fullKey = reassembleKey(project.key.partial_key_server, apiKey);
			} catch (error) {
				console.error("Error reassembling key:", error);
				return c.json({ error: "Invalid API key" }, 401);
			}

			const startTime = Date.now();
			try {
				const { image } = await c.req.json();

				if (!image) {
					return c.json({ error: "Image is required" }, 400);
				}

				const schema = jsonToZod(project.schema_config as unknown as JsonSchema)
					.data!;

				const { object, usage, finishReason } = await generateObject({
					model: openai("gpt-4o-mini", { structuredOutputs: true }),
					schema,
					messages: [
						{
							role: "system",
							content:
								"You are a plant identification expert. If multiple plants are present in the image, analyze only the most prominent or closest plant to the camera. If you cannot identify the plant with high confidence, set isValid to false and provide generic or 'Unknown' values. If you can identify the plant, set isValid to true and provide detailed information.",
						},
						{
							role: "user",
							content: [
								{
									type: "text",
									text: "Analyze this plant image and provide detailed information about the most prominent or closest plant in the image. If you cannot identify the plant with confidence, set isValid to false.",
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
					model: "gpt-4o-mini",
					provider: "OPENAI",
					prompt_tokens: usage.promptTokens,
					completion_tokens: usage.completionTokens,
					finish_reason: finishReason,
					latency,
					response_code: 200,
					response: JSON.stringify(object),
				});

				return c.json(object);
			} catch (error) {
				console.error("Plant classification error:", error);
				const latency = Date.now() - startTime;

				// Create execution record for error case
				await createExecution(supabase, {
					team_id: teamId,
					project_id: projectId,
					device_check_id: deviceCheckId,
					key_id: keyId,
					ip,
					user_agent: userAgent ?? undefined,
					model: "gpt-4o",
					provider: "OPENAI",
					prompt_tokens: 0,
					completion_tokens: 0,
					finish_reason: "error",
					latency,
					response_code: 500,
					error_message:
						error instanceof Error ? error.message : "Unknown error",
					error_code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
				});

				const errorResponse = { error };
				return c.json(errorResponse, 500);
			}
		},
	);
