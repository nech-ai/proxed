import { openai } from "@ai-sdk/openai";
import { type JsonSchema, jsonToZod } from "@proxed/structure";
import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { generateObject } from "ai";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../middleware/auth";
import type { AuthMiddlewareVariables } from "../types";

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
			const { projectId } = c.get("session");
			const ip =
				c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip");

			const supabase = createClient();
			const { data: project, error } = await getProjectQuery(
				supabase,
				projectId,
			);

			if (error || !project) {
				return c.json({ error: "Project not found" }, 404);
			}
			try {
				const { image } = await c.req.json();

				if (!image) {
					return c.json({ error: "Image is required" }, 400);
				}

				const schema = jsonToZod(project.schema_config as unknown as JsonSchema)
					.data!;

				const { object, usage, finishReason } = await generateObject({
					model: openai("gpt-4o", { structuredOutputs: true }),
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
				return c.json(object);
			} catch (error) {
				console.error("Plant classification error:", error);

				const errorResponse = {
					error: error,
				};
				return c.json(errorResponse, 500);
			}
		},
	);
