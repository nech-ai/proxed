import { describe, test, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { googleRouter } from "../rest/routes/google";
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
	validateAndGetProject: vi.fn().mockResolvedValue({
		project: { id: "test-project", keyId: "test-key" },
		teamId: "test-team",
		apiKey: "test-api-key",
		db: {},
	}),
	getFullApiKey: vi.fn().mockResolvedValue("full-api-key"),
	recordExecution: vi.fn(),
	withTimeout: vi.fn().mockImplementation((promise) =>
		promise.then((result) => ({
			response: result,
			latency: 100,
			retries: 0,
		})),
	),
}));

vi.mock("../utils/base-proxy", () => ({
	baseProxy: vi.fn().mockResolvedValue(
		new Response(
			JSON.stringify({
				candidates: [
					{
						content: {
							parts: [{ text: "Hello from Gemini!" }],
							role: "model",
						},
						finishReason: "STOP",
					},
				],
				usageMetadata: {
					promptTokenCount: 10,
					candidatesTokenCount: 5,
					totalTokenCount: 15,
				},
			}),
			{
				status: 200,
				headers: new Headers({ "content-type": "application/json" }),
			},
		),
	),
}));

vi.mock("../utils/metrics", () => ({
	collectMetrics: vi.fn(),
}));

describe("Google Proxy", () => {
	let app: Hono<AppContext>;

	beforeEach(() => {
		vi.clearAllMocks();
		app = new Hono<AppContext>();
		app.route("/v1/google", googleRouter);
	});

	test("should proxy requests to Google AI API", async () => {
		const response = await app.request(
			"/v1/google/test-project/models/gemini-pro:generateContent",
			{
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					contents: [{ parts: [{ text: "Hello" }] }],
				}),
			},
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty("candidates");
		expect(data.candidates[0].content.parts[0].text).toBe("Hello from Gemini!");
	});

	test("should handle Google AI specific response format", async () => {
		const response = await app.request(
			"/v1/google/test-project/models/gemini-pro:generateContent",
			{
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					contents: [{ parts: [{ text: "Test prompt" }] }],
				}),
			},
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.usageMetadata).toEqual({
			promptTokenCount: 10,
			candidatesTokenCount: 5,
			totalTokenCount: 15,
		});
	});

	test("should add debug headers", async () => {
		const response = await app.request(
			"/v1/google/test-project/models/gemini-pro:generateContent",
			{
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					contents: [{ parts: [{ text: "Test" }] }],
				}),
			},
		);

		expect(response.headers.get("X-Proxed-Retries")).toBe("0");
		expect(response.headers.get("X-Proxed-Latency")).toBe("100");
	});
});