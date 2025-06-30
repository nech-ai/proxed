import { describe, test, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { textResponseRouter } from "../rest/routes/text";
import { visionResponseRouter } from "../rest/routes/vision";
import { pdfResponseRouter } from "../rest/routes/pdf";
import type { Context as AppContext } from "../rest/types";

// Mock dependencies
vi.mock("../utils/logger", () => ({
	logger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("../utils/route-handlers", () => ({
	validateAndGetProject: vi.fn().mockImplementation(() => ({
		project: {
			id: "test-project",
			keyId: "test-key",
			key: { provider: "GOOGLE" },
			model: "gemini-1.5-pro",
			systemPrompt: "You are a helpful assistant",
			defaultUserPrompt: "Analyze this content",
			schemaConfig: {
				type: "object",
				properties: {
					summary: { type: "string" },
					confidence: { type: "number" },
				},
				required: ["summary", "confidence"],
			},
		},
		teamId: "test-team",
		apiKey: "test-api-key",
		db: {},
	})),
	getFullApiKey: vi.fn().mockResolvedValue("full-google-api-key"),
	validateRequestBody: vi.fn().mockImplementation((_, schema) => {
		// Return mock data based on the schema
		if (schema.shape.text) return { text: "Test text content" };
		if (schema.shape.image) return { image: "data:image/png;base64,test" };
		if (schema.shape.pdf) return { pdf: "data:application/pdf;base64,test" };
		return {};
	}),
	recordExecution: vi.fn(),
	withTimeout: vi.fn().mockImplementation((promise) => promise),
}));

vi.mock("@proxed/structure", () => ({
	ZodParser: vi.fn().mockImplementation(() => ({
		convertJsonSchemaToZodValidator: vi.fn().mockReturnValue({
			parse: (data: any) => data,
		}),
	})),
}));

vi.mock("ai", () => ({
	generateObject: vi.fn().mockResolvedValue({
		object: {
			summary: "This is a test summary",
			confidence: 0.95,
		},
		usage: {
			promptTokens: 100,
			completionTokens: 50,
		},
		finishReason: "stop",
	}),
}));

vi.mock("../utils/ai-client", () => ({
	createAIClient: vi.fn().mockReturnValue(() => ({
		model: "gemini-1.5-pro",
		provider: "google",
	})),
}));

describe("Structured Endpoints with Google Provider", () => {
	describe("Text Endpoint", () => {
		let app: Hono<AppContext>;

		beforeEach(() => {
			vi.clearAllMocks();
			app = new Hono<AppContext>();
			app.route("/v1/text", textResponseRouter);
		});

		test("should handle text requests with Google provider", async () => {
			const response = await app.request("/v1/text/test-project", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					text: "Analyze this text with Gemini",
				}),
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({
				summary: "This is a test summary",
				confidence: 0.95,
			});
		});

		test("should use default Google model when none specified", async () => {
			// Mock project without model
			const { validateAndGetProject } = await import("../utils/route-handlers");
			(validateAndGetProject as any).mockResolvedValueOnce({
				project: {
					id: "test-project",
					keyId: "test-key",
					key: { provider: "GOOGLE" },
					model: null,
					schemaConfig: { type: "object", properties: {} },
				},
				teamId: "test-team",
				apiKey: "test-api-key",
				db: {},
			});

			const response = await app.request("/v1/text/test-project", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({ text: "Test" }),
			});

			expect(response.status).toBe(200);
		});
	});

	describe("Vision Endpoint", () => {
		let app: Hono<AppContext>;

		beforeEach(() => {
			vi.clearAllMocks();
			app = new Hono<AppContext>();
			app.route("/v1/vision", visionResponseRouter);
		});

		test("should handle vision requests with Google provider", async () => {
			const response = await app.request("/v1/vision/test-project", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					image: "data:image/png;base64,iVBORw0KGgoAAAANS...",
				}),
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({
				summary: "This is a test summary",
				confidence: 0.95,
			});
		});

		test("should validate vision model support", async () => {
			// Mock project with non-vision model
			const { validateAndGetProject } = await import("../utils/route-handlers");
			(validateAndGetProject as any).mockResolvedValueOnce({
				project: {
					id: "test-project",
					keyId: "test-key",
					key: { provider: "GOOGLE" },
					model: "text-embedding-004", // Embedding model doesn't support vision
					schemaConfig: { type: "object", properties: {} },
				},
				teamId: "test-team",
				apiKey: "test-api-key",
				db: {},
			});

			const response = await app.request("/v1/vision/test-project", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({ image: "data:image/png;base64,test" }),
			});

			expect(response.status).toBe(400);
			const error = await response.json();
			expect(error.error).toContain("does not support vision inputs");
		});
	});

	describe("PDF Endpoint", () => {
		let app: Hono<AppContext>;

		beforeEach(() => {
			vi.clearAllMocks();
			app = new Hono<AppContext>();
			app.route("/v1/pdf", pdfResponseRouter);
		});

		test("should handle PDF requests with Google provider", async () => {
			const response = await app.request("/v1/pdf/test-project", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					pdf: "data:application/pdf;base64,JVBERi0xLjQKJeLj...",
				}),
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({
				summary: "This is a test summary",
				confidence: 0.95,
			});
		});

		test("should validate PDF model support", async () => {
			// Mock project with model that doesn't support PDFs
			const { validateAndGetProject } = await import("../utils/route-handlers");
			(validateAndGetProject as any).mockResolvedValueOnce({
				project: {
					id: "test-project",
					keyId: "test-key",
					key: { provider: "GOOGLE" },
					model: "gemini-embedding-exp", // Embedding model doesn't support PDFs
					schemaConfig: { type: "object", properties: {} },
				},
				teamId: "test-team",
				apiKey: "test-api-key",
				db: {},
			});

			const response = await app.request("/v1/pdf/test-project", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({ pdf: "data:application/pdf;base64,test" }),
			});

			expect(response.status).toBe(400);
			const error = await response.json();
			expect(error.error).toContain("does not support PDF inputs");
		});
	});

	describe("Cross-Provider Compatibility", () => {
		test("should handle all providers for text endpoint", async () => {
			const providers = ["OPENAI", "ANTHROPIC", "GOOGLE"];
			const models = ["gpt-4o", "claude-3-5-sonnet-latest", "gemini-1.5-pro"];

			for (let i = 0; i < providers.length; i++) {
				const { validateAndGetProject } = await import(
					"../utils/route-handlers"
				);
				(validateAndGetProject as any).mockResolvedValueOnce({
					project: {
						id: "test-project",
						keyId: "test-key",
						key: { provider: providers[i] },
						model: models[i],
						schemaConfig: { type: "object", properties: {} },
					},
					teamId: "test-team",
					apiKey: "test-api-key",
					db: {},
				});

				const app = new Hono<AppContext>();
				app.route("/v1/text", textResponseRouter);

				const response = await app.request("/v1/text/test-project", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						authorization: "Bearer test-token",
					},
					body: JSON.stringify({ text: `Test with ${providers[i]}` }),
				});

				expect(response.status).toBe(200);
			}
		});
	});
});