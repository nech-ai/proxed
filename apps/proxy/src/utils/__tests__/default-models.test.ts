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
			expect(getDefaultModel("OPENAI")).toBe("gpt-4.1-mini");
			expect(getDefaultModel("ANTHROPIC")).toBe("claude-sonnet-4-0");
			expect(getDefaultModel("GOOGLE")).toBe("gemini-2.5-flash");
		});

		test("should return fallback for unknown provider", () => {
			expect(getDefaultModel("UNKNOWN" as ProviderType)).toBe("gpt-4.1-mini");
		});
	});

	describe("supportsStructuredOutputs", () => {
		test("should return true for known OpenAI text models", () => {
			const openAIModels = [
				"gpt-5.2",
				"gpt-5",
				"gpt-5-mini",
				"gpt-4.1",
				"gpt-4.1-mini",
				"gpt-4.1-nano",
				"gpt-4o",
				"gpt-4o-mini",
				"gpt-4-turbo",
				"gpt-4",
				"gpt-3.5-turbo",
				"o1",
				"o1-mini",
				"o1-preview",
				"o3-pro",
				"o3",
				"o3-mini",
				"o4-mini",
				"chatgpt-4o-latest",
			];

			for (const model of openAIModels) {
				expect(supportsStructuredOutputs("OPENAI", model)).toBe(true);
			}
		});

		test("should return true for known Anthropic text models", () => {
			const anthropicModels = [
				"claude-opus-4-5",
				"claude-sonnet-4-5",
				"claude-haiku-4-5",
				"claude-opus-4-1",
				"claude-opus-4-0",
				"claude-sonnet-4-0",
				"claude-opus-4-20250514",
				"claude-sonnet-4-20250514",
				"claude-3-7-sonnet-20250219",
				"claude-3-5-sonnet-20241022",
				"claude-3-5-sonnet-20240620",
				"claude-3-5-haiku-20241022",
				"claude-3-opus-20240229",
				"claude-3-sonnet-20240229",
				"claude-3-haiku-20240307",
			];

			for (const model of anthropicModels) {
				expect(supportsStructuredOutputs("ANTHROPIC", model)).toBe(true);
			}
		});

		test("should return true for known Google text models", () => {
			const googleModels = [
				"gemini-3-pro-preview",
				"gemini-3-flash-preview",
				"gemini-3-pro-image-preview",
				"gemini-2.5-pro",
				"gemini-2.5-flash",
				"gemini-2.5-flash-lite",
				"gemini-2.0-flash",
				"gemini-2.0-flash-lite",
				"gemini-2.0-flash-exp",
				"gemini-1.5-pro",
				"gemini-1.5-flash",
				"gemini-1.5-flash-8b",
			];

			for (const model of googleModels) {
				expect(supportsStructuredOutputs("GOOGLE", model)).toBe(true);
			}
		});

		test("should return false for unsupported models", () => {
			expect(supportsStructuredOutputs("OPENAI", "unsupported-model")).toBe(
				false,
			);
			expect(supportsStructuredOutputs("ANTHROPIC", "claude-2")).toBe(false);
			expect(supportsStructuredOutputs("GOOGLE", "palm-2")).toBe(false);
		});
	});

	describe("getVisionModel", () => {
		test("should return default vision models", () => {
			expect(getVisionModel("OPENAI")).toBe("gpt-4o");
			expect(getVisionModel("ANTHROPIC")).toBe("claude-sonnet-4-0");
			expect(getVisionModel("GOOGLE")).toBe("gemini-2.5-flash");
		});

		test("should return preferred model if it supports vision", () => {
			expect(getVisionModel("OPENAI", "gpt-4o-mini")).toBe("gpt-4o-mini");
			expect(getVisionModel("ANTHROPIC", "claude-3-5-haiku-20241022")).toBe(
				"claude-3-5-haiku-20241022",
			);
			expect(getVisionModel("GOOGLE", "gemini-1.5-pro")).toBe("gemini-1.5-pro");
		});

		test("should return default if preferred model doesn't support vision", () => {
			expect(getVisionModel("OPENAI", "unsupported-model")).toBe("gpt-4o");
			expect(getVisionModel("ANTHROPIC", "claude-instant")).toBe(
				"claude-sonnet-4-0",
			);
			expect(getVisionModel("GOOGLE", "bard")).toBe("gemini-2.5-flash");
		});
	});

	describe("supportsVision", () => {
		test("should return true for all AI SDK 5 models", () => {
			// Test a few models from each provider
			expect(supportsVision("OPENAI", "gpt-4o")).toBe(true);
			expect(supportsVision("OPENAI", "gpt-4.1-mini")).toBe(true);
			expect(supportsVision("ANTHROPIC", "claude-sonnet-4-0")).toBe(true);
			expect(supportsVision("ANTHROPIC", "claude-3-5-haiku-20241022")).toBe(
				true,
			);
			expect(supportsVision("GOOGLE", "gemini-2.5-flash")).toBe(true);
			expect(supportsVision("GOOGLE", "gemini-1.5-pro")).toBe(true);
		});

		test("should return false for unsupported models", () => {
			expect(supportsVision("OPENAI", "text-davinci-003")).toBe(false);
			expect(supportsVision("ANTHROPIC", "claude-1")).toBe(false);
			expect(supportsVision("GOOGLE", "text-bison")).toBe(false);
		});
	});

	describe("supportsPDF", () => {
		test("should return true for all AI SDK 5 models", () => {
			// Test a few models from each provider
			expect(supportsPDF("OPENAI", "gpt-4o")).toBe(true);
			expect(supportsPDF("OPENAI", "gpt-4.1-mini")).toBe(true);
			expect(supportsPDF("ANTHROPIC", "claude-sonnet-4-0")).toBe(true);
			expect(supportsPDF("ANTHROPIC", "claude-3-5-haiku-20241022")).toBe(true);
			expect(supportsPDF("GOOGLE", "gemini-2.5-flash")).toBe(true);
			expect(supportsPDF("GOOGLE", "gemini-1.5-pro")).toBe(true);
		});

		test("should return false for unsupported models", () => {
			expect(supportsPDF("OPENAI", "text-embedding-ada-002")).toBe(false);
			expect(supportsPDF("ANTHROPIC", "claude-instant-1")).toBe(false);
			expect(supportsPDF("GOOGLE", "code-gecko")).toBe(false);
		});
	});
});
