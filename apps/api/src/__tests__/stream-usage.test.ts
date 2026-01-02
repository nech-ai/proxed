import { describe, expect, mock, test } from "bun:test";
import { resolve } from "node:path";

const __dirname = new URL(".", import.meta.url).pathname;

process.env.RESEND_API_KEY = "re_test_key";

mock.module("resend", () => {
	return {
		Resend: class {
			emails = {
				send: async () => ({ id: "test-email-id" }),
			};
		},
	};
});

mock.module(resolve(__dirname, "../../packages/utils/lib/resend.ts"), () => {
	return {
		resend: {
			emails: {
				send: async () => ({ id: "test-email-id" }),
			},
		},
	};
});

const { collectStreamMetrics } = await import("../utils/provider-proxy");
const { PROVIDERS } = await import("@proxed/utils/lib/providers");

const encoder = new TextEncoder();

function createSseStream(
	events: string[],
	chunkSize = 32,
): ReadableStream<Uint8Array> {
	const payload = events.map((event) => `data: ${event}\n\n`).join("");
	const chunks: string[] = [];

	for (let i = 0; i < payload.length; i += chunkSize) {
		chunks.push(payload.slice(i, i + chunkSize));
	}

	return new ReadableStream<Uint8Array>({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
			}
			controller.close();
		},
	});
}

describe("stream usage parsing", () => {
	test("parses OpenAI SSE usage, model, and finishReason", async () => {
		const events = [
			JSON.stringify({
				id: "chatcmpl-1",
				model: "gpt-4o-mini",
				choices: [{ delta: { content: "hi" } }],
			}),
			JSON.stringify({
				choices: [{ finish_reason: "stop" }],
				usage: {
					prompt_tokens: 12,
					completion_tokens: 34,
					total_tokens: 46,
				},
			}),
		];

		const metrics = await collectStreamMetrics(
			createSseStream(events, 18),
			PROVIDERS.OPENAI,
			"text/event-stream",
		);

		expect(metrics.model).toBe("gpt-4o-mini");
		expect(metrics.promptTokens).toBe(12);
		expect(metrics.completionTokens).toBe(34);
		expect(metrics.totalTokens).toBe(46);
		expect(metrics.finishReason).toBe("stop");
	});

	test("parses Anthropic SSE usage, model, and finishReason", async () => {
		const events = [
			JSON.stringify({
				type: "message_start",
				message: {
					model: "claude-3-5-haiku-20241022",
					usage: { input_tokens: 7 },
				},
			}),
			JSON.stringify({
				type: "message_delta",
				delta: { stop_reason: "end_turn" },
				usage: { output_tokens: 9 },
			}),
		];

		const metrics = await collectStreamMetrics(
			createSseStream(events, 21),
			PROVIDERS.ANTHROPIC,
			"text/event-stream",
		);

		expect(metrics.model).toBe("claude-3-5-haiku-20241022");
		expect(metrics.promptTokens).toBe(7);
		expect(metrics.completionTokens).toBe(9);
		expect(metrics.totalTokens).toBe(16);
		expect(metrics.finishReason).toBe("stop");
	});

	test("parses Google SSE usage, model, and finishReason", async () => {
		const events = [
			JSON.stringify({
				modelVersion: "models/gemini-1.5-pro",
				usageMetadata: {
					promptTokenCount: 5,
					candidatesTokenCount: 11,
					totalTokenCount: 16,
				},
				candidates: [{ finishReason: "STOP" }],
			}),
		];

		const metrics = await collectStreamMetrics(
			createSseStream(events, 19),
			PROVIDERS.GOOGLE,
			"text/event-stream",
		);

		expect(metrics.model).toBe("gemini-1.5-pro");
		expect(metrics.promptTokens).toBe(5);
		expect(metrics.completionTokens).toBe(11);
		expect(metrics.totalTokens).toBe(16);
		expect(metrics.finishReason).toBe("stop");
	});
});
