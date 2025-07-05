import { describe, test, expect } from "bun:test";
import {
	getDefaultModel,
	supportsStructuredOutputs,
	getVisionModel,
	supportsVision,
	supportsPDF,
} from "../default-models";
import type { ProviderType } from "../../rest/types";

describe("default-models", () => {
	describe("getDefaultModel", () => {
		test("should return correct default models for each provider", () => {
			expect(getDefaultModel("OPENAI")).toBe("gpt-4o");
			expect(getDefaultModel("ANTHROPIC")).toBe("claude-3-5-sonnet-latest");
			expect(getDefaultModel("GOOGLE")).toBe("gemini-2.5-pro");
		});

		test("should return fallback for unknown provider", () => {
			expect(getDefaultModel("UNKNOWN" as ProviderType)).toBe("gpt-4o");
		});
	});

	describe("supportsStructuredOutputs", () => {
		describe("OpenAI", () => {
			test("should support modern OpenAI models", () => {
				// GPT-4.1 series
				expect(supportsStructuredOutputs("OPENAI", "gpt-4.1")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "gpt-4.1-mini")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "gpt-4.1-nano")).toBe(true);

				// GPT-4o series
				expect(supportsStructuredOutputs("OPENAI", "gpt-4o")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "gpt-4o-mini")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "gpt-4o-2024-11-20")).toBe(
					true,
				);

				// GPT-4 Turbo
				expect(supportsStructuredOutputs("OPENAI", "gpt-4-turbo")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "gpt-4")).toBe(true);

				// o1 series
				expect(supportsStructuredOutputs("OPENAI", "o1")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "o1-mini")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "o1-preview")).toBe(true);

				// o3 series
				expect(supportsStructuredOutputs("OPENAI", "o3")).toBe(true);
				expect(supportsStructuredOutputs("OPENAI", "o3-mini")).toBe(true);

				// o4 series
				expect(supportsStructuredOutputs("OPENAI", "o4-mini")).toBe(true);
			});

			test("should not support old/unknown OpenAI models", () => {
				expect(supportsStructuredOutputs("OPENAI", "gpt-3.5-turbo")).toBe(
					false,
				);
				expect(supportsStructuredOutputs("OPENAI", "text-davinci-003")).toBe(
					false,
				);
			});
		});

		describe("Anthropic", () => {
			test("should support all Claude models", () => {
				expect(
					supportsStructuredOutputs("ANTHROPIC", "claude-3-opus-20240229"),
				).toBe(true);
				expect(
					supportsStructuredOutputs("ANTHROPIC", "claude-3-5-sonnet-latest"),
				).toBe(true);
				expect(
					supportsStructuredOutputs("ANTHROPIC", "claude-3-haiku-20240307"),
				).toBe(true);
				expect(
					supportsStructuredOutputs("ANTHROPIC", "claude-opus-4-20250514"),
				).toBe(true);
				expect(
					supportsStructuredOutputs("ANTHROPIC", "claude-sonnet-4-20250514"),
				).toBe(true);
			});
		});

		describe("Google", () => {
			test("should support modern Gemini models", () => {
				expect(supportsStructuredOutputs("GOOGLE", "gemini-1.5-pro")).toBe(
					true,
				);
				expect(supportsStructuredOutputs("GOOGLE", "gemini-1.5-flash")).toBe(
					true,
				);
				expect(supportsStructuredOutputs("GOOGLE", "gemini-2.0-flash")).toBe(
					true,
				);
				expect(supportsStructuredOutputs("GOOGLE", "gemini-2.5-pro")).toBe(
					true,
				);
				expect(supportsStructuredOutputs("GOOGLE", "gemini-2.5-flash")).toBe(
					true,
				);
				expect(supportsStructuredOutputs("GOOGLE", "gemini-pro")).toBe(true);
				expect(supportsStructuredOutputs("GOOGLE", "gemini-pro-vision")).toBe(
					true,
				);
			});

			test("should not support embedding models", () => {
				expect(supportsStructuredOutputs("GOOGLE", "text-embedding-004")).toBe(
					false,
				);
				expect(supportsStructuredOutputs("GOOGLE", "embedding-001")).toBe(
					false,
				);
				expect(
					supportsStructuredOutputs("GOOGLE", "gemini-embedding-exp"),
				).toBe(false);
			});
		});
	});

	describe("supportsVision", () => {
		describe("OpenAI", () => {
			test("should support vision-capable OpenAI models", () => {
				expect(supportsVision("OPENAI", "gpt-4.1")).toBe(true);
				expect(supportsVision("OPENAI", "gpt-4.1-mini")).toBe(true);
				expect(supportsVision("OPENAI", "gpt-4o")).toBe(true);
				expect(supportsVision("OPENAI", "gpt-4o-mini")).toBe(true);
				expect(supportsVision("OPENAI", "gpt-4-turbo")).toBe(true);
				expect(supportsVision("OPENAI", "gpt-4")).toBe(true);
				expect(supportsVision("OPENAI", "gpt-4-vision-preview")).toBe(true);
			});

			test("should not support non-vision OpenAI models", () => {
				expect(supportsVision("OPENAI", "o1")).toBe(false);
				expect(supportsVision("OPENAI", "o1-mini")).toBe(false);
				expect(supportsVision("OPENAI", "gpt-3.5-turbo")).toBe(false);
			});
		});

		describe("Anthropic", () => {
			test("should support all Claude models for vision", () => {
				expect(supportsVision("ANTHROPIC", "claude-3-opus-20240229")).toBe(
					true,
				);
				expect(supportsVision("ANTHROPIC", "claude-3-5-sonnet-latest")).toBe(
					true,
				);
				expect(supportsVision("ANTHROPIC", "claude-3-haiku-20240307")).toBe(
					true,
				);
				expect(supportsVision("ANTHROPIC", "claude-opus-4-20250514")).toBe(
					true,
				);
			});
		});

		describe("Google", () => {
			test("should support vision-capable Gemini models", () => {
				expect(supportsVision("GOOGLE", "gemini-1.5-pro")).toBe(true);
				expect(supportsVision("GOOGLE", "gemini-1.5-flash")).toBe(true);
				expect(supportsVision("GOOGLE", "gemini-2.0-flash")).toBe(true);
				expect(supportsVision("GOOGLE", "gemini-2.5-pro")).toBe(true);
				expect(supportsVision("GOOGLE", "gemini-2.5-flash")).toBe(true);
				expect(supportsVision("GOOGLE", "gemini-pro")).toBe(true);
				expect(supportsVision("GOOGLE", "gemini-pro-vision")).toBe(true);
			});

			test("should not support embedding models for vision", () => {
				expect(supportsVision("GOOGLE", "text-embedding-004")).toBe(false);
				expect(supportsVision("GOOGLE", "embedding-001")).toBe(false);
				expect(supportsVision("GOOGLE", "gemini-embedding-exp")).toBe(false);
			});
		});
	});

	describe("supportsPDF", () => {
		describe("OpenAI", () => {
			test("should support PDF for modern OpenAI models", () => {
				expect(supportsPDF("OPENAI", "gpt-4.1")).toBe(true);
				expect(supportsPDF("OPENAI", "gpt-4.1-mini")).toBe(true);
				expect(supportsPDF("OPENAI", "gpt-4o")).toBe(true);
				expect(supportsPDF("OPENAI", "gpt-4o-mini")).toBe(true);
				expect(supportsPDF("OPENAI", "gpt-4-turbo")).toBe(true);
			});

			test("should not support PDF for older OpenAI models", () => {
				expect(supportsPDF("OPENAI", "gpt-4")).toBe(false);
				expect(supportsPDF("OPENAI", "gpt-3.5-turbo")).toBe(false);
				expect(supportsPDF("OPENAI", "o1")).toBe(false);
			});
		});

		describe("Anthropic", () => {
			test("should support PDF for all Claude models", () => {
				expect(supportsPDF("ANTHROPIC", "claude-3-opus-20240229")).toBe(true);
				expect(supportsPDF("ANTHROPIC", "claude-3-5-sonnet-latest")).toBe(true);
				expect(supportsPDF("ANTHROPIC", "claude-3-haiku-20240307")).toBe(true);
				expect(supportsPDF("ANTHROPIC", "claude-opus-4-20250514")).toBe(true);
			});
		});

		describe("Google", () => {
			test("should support PDF for modern Gemini models", () => {
				expect(supportsPDF("GOOGLE", "gemini-1.5-pro")).toBe(true);
				expect(supportsPDF("GOOGLE", "gemini-1.5-flash")).toBe(true);
				expect(supportsPDF("GOOGLE", "gemini-2.0-flash")).toBe(true);
				expect(supportsPDF("GOOGLE", "gemini-2.5-pro")).toBe(true);
				expect(supportsPDF("GOOGLE", "gemini-2.5-flash")).toBe(true);
				expect(supportsPDF("GOOGLE", "gemini-pro")).toBe(true);
				expect(supportsPDF("GOOGLE", "gemini-pro-vision")).toBe(true);
			});

			test("should not support PDF for embedding models", () => {
				expect(supportsPDF("GOOGLE", "text-embedding-004")).toBe(false);
				expect(supportsPDF("GOOGLE", "embedding-001")).toBe(false);
				expect(supportsPDF("GOOGLE", "gemini-embedding-exp")).toBe(false);
			});
		});
	});

	describe("getVisionModel", () => {
		test("should return preferred model if it supports vision", () => {
			expect(getVisionModel("OPENAI", "gpt-4o-mini")).toBe("gpt-4o-mini");
			expect(getVisionModel("ANTHROPIC", "claude-3-haiku-20240307")).toBe(
				"claude-3-haiku-20240307",
			);
			expect(getVisionModel("GOOGLE", "gemini-1.5-flash")).toBe(
				"gemini-1.5-flash",
			);
		});

		test("should return default model if preferred doesn't support vision", () => {
			expect(getVisionModel("OPENAI", "o1")).toBe("gpt-4o");
			expect(getVisionModel("OPENAI", "gpt-3.5-turbo")).toBe("gpt-4o");
			expect(getVisionModel("GOOGLE", "text-embedding-004")).toBe(
				"gemini-2.5-pro",
			);
		});

		test("should return default model when no preferred model specified", () => {
			expect(getVisionModel("OPENAI")).toBe("gpt-4o");
			expect(getVisionModel("ANTHROPIC")).toBe("claude-3-5-sonnet-latest");
			expect(getVisionModel("GOOGLE")).toBe("gemini-2.5-pro");
		});
	});
});
