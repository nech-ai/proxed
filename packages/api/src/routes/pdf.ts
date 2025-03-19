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
import { Headers } from "@proxed/location/constants";

type CommonExecutionParams = {
	teamId: string;
	projectId: string;
	deviceCheckId: string;
	keyId: string;
	ip: string | undefined;
	userAgent: string | undefined;
	model: string;
	provider: "OPENAI" | "ANTHROPIC";
	c: Context;
};

const getCommonExecutionParams = ({
	teamId,
	projectId,
	deviceCheckId,
	keyId,
	ip,
	userAgent,
	model,
	provider,
	c,
}: CommonExecutionParams) => ({
	team_id: teamId,
	project_id: projectId,
	device_check_id: deviceCheckId,
	key_id: keyId,
	ip,
	user_agent: userAgent ?? undefined,
	model,
	provider,
	country_code: c.req.header(Headers.CountryCode),
	region_code: c.req.header(Headers.RegionCode),
	city: c.req.header(Headers.City),
	longitude:
		Number.parseFloat(c.req.header(Headers.Longitude) ?? "0") || undefined,
	latitude:
		Number.parseFloat(c.req.header(Headers.Latitude) ?? "0") || undefined,
});

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
		pdf: z
			.string()
			.nonempty("PDF content is required")
			.regex(/^data:application\/pdf;base64,/, "Invalid PDF base64 format")
			.or(z.string().url("Invalid PDF URL")),
	});
	const result = bodySchema.safeParse(bodyData);
	if (!result.success) {
		return c.json({ error: result.error.flatten() }, 400);
	}
	const { pdf } = result.data;

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

	// Get the server key part using the function
	const { data: serverKey } = await supabase.rpc("get_server_key", {
		p_provider_key_id: project.key_id,
	});

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
		const openaiClient = createOpenAI({
			apiKey: fullApiKey,
		});

		let pdfData: Buffer;
		if (pdf.startsWith("data:application/pdf;base64,")) {
			pdfData = Buffer.from(
				pdf.replace(/^data:application\/pdf;base64,/, ""),
				"base64",
			);
		} else {
			// If it's a URL, fetch the PDF
			const response = await fetch(pdf);
			if (!response.ok) {
				throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
			}
			const arrayBuffer = await response.arrayBuffer();
			pdfData = Buffer.from(arrayBuffer);
		}

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
								project.default_user_prompt ??
								"Analyze the following PDF and generate a structured response.",
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
		});

		const latency = Date.now() - startTime;

		await createExecution(supabase, {
			...commonParams,
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

		await createExecution(supabase, {
			...commonParams,
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

export const pdfResponseRouter = new Hono<{
	Variables: AuthMiddlewareVariables;
}>()
	.use("/", authMiddleware)
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
	.use("/:projectId", authMiddleware)
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
