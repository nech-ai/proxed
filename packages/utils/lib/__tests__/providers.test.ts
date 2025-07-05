import { describe, test, expect } from "bun:test";
import {
	PROVIDERS,
	MODELS,
	ALL_MODELS,
	getModelsForProvider,
	getModelDisplayName,
	getModelBadge,
	isModelForProvider,
	getProviderForModel,
	isValidModel,
	getModelOptions,
	PROVIDER_VALUES,
	MODEL_VALUES,
	FINISH_REASONS,
} from "../providers";
import type { Provider, Model } from "../providers";

describe("Provider Functions", () => {
	describe("Constants", () => {
		test("should have correct provider constants", () => {
			expect(PROVIDERS).toEqual({
				OPENAI: "OPENAI",
				ANTHROPIC: "ANTHROPIC",
				GOOGLE: "GOOGLE",
			});
			expect(PROVIDER_VALUES).toEqual(["OPENAI", "ANTHROPIC", "GOOGLE"]);
		});

		test("should have correct finish reasons", () => {
			expect(FINISH_REASONS).toEqual([
				"stop",
				"length",
				"content-filter",
				"tool-calls",
				"error",
				"other",
				"unknown",
			]);
		});
	});

	describe("getModelsForProvider", () => {
		test("should return OpenAI models", () => {
			const models = getModelsForProvider("OPENAI");
			expect(models).toContain("gpt-4o");
			expect(models).toContain("gpt-4o-mini");
			expect(models).toContain("o1");
			expect(models.length).toBeGreaterThan(20);
		});

		test("should return Anthropic models", () => {
			const models = getModelsForProvider("ANTHROPIC");
			expect(models).toContain("claude-3-opus-20240229");
			expect(models).toContain("claude-3-5-sonnet-20241022");
			expect(models).toContain("claude-3-haiku-20240307");
			expect(models.length).toBeGreaterThan(10);
		});

		test("should return Google models", () => {
			const models = getModelsForProvider("GOOGLE");
			expect(models).toContain("gemini-2.5-pro");
			expect(models).toContain("gemini-1.5-flash");
			expect(models).toContain("gemini-pro");
			expect(models).toContain("text-embedding-004");
			expect(models.length).toBeGreaterThan(10);
		});
	});

	describe("getModelDisplayName", () => {
		test("should return correct display names for OpenAI models", () => {
			expect(getModelDisplayName("gpt-4o")).toBe("GPT-4o");
			expect(getModelDisplayName("gpt-4o-mini")).toBe("GPT-4o Mini");
			expect(getModelDisplayName("o1-pro")).toBe("o1 Pro");
			expect(getModelDisplayName("gpt-4.1-nano")).toBe("GPT-4.1 Nano");
		});

		test("should return correct display names for Anthropic models", () => {
			expect(getModelDisplayName("claude-3-opus-20240229")).toBe(
				"Claude 3 Opus",
			);
			expect(getModelDisplayName("claude-3-5-haiku-20241022")).toBe(
				"Claude 3.5 Haiku",
			);
			expect(getModelDisplayName("claude-3-7-sonnet-latest")).toBe(
				"Claude 3.7 Sonnet (Latest)",
			);
		});

		test("should return correct display names for Google models", () => {
			expect(getModelDisplayName("gemini-2.5-pro")).toBe("Gemini 2.5 Pro");
			expect(getModelDisplayName("gemini-1.5-flash")).toBe("Gemini 1.5 Flash");
			expect(getModelDisplayName("gemini-pro-vision")).toBe(
				"Gemini Pro Vision",
			);
			expect(getModelDisplayName("text-embedding-004")).toBe(
				"Text Embedding 004",
			);
		});

		test("should return model ID for unknown models", () => {
			expect(getModelDisplayName("unknown-model" as Model)).toBe(
				"unknown-model",
			);
		});
	});

	describe("getModelBadge", () => {
		test("should return correct badges", () => {
			expect(getModelBadge("gpt-4.1")).toBe("new");
			expect(getModelBadge("gpt-4.5-preview")).toBe("preview");
			expect(getModelBadge("gpt-4o-2024-05-13")).toBe("deprecated");
			expect(getModelBadge("gemini-2.5-pro")).toBe("new");
			expect(getModelBadge("gemini-2.5-flash-lite-preview-06-17")).toBe(
				"preview",
			);
			expect(getModelBadge("gemini-embedding-exp")).toBe("experimental");
			expect(getModelBadge("gpt-4o")).toBeUndefined();
		});

		test("should return undefined for models without badges", () => {
			expect(getModelBadge("gpt-4o-mini")).toBeUndefined();
			expect(getModelBadge("claude-3-haiku-20240307")).toBeUndefined();
		});
	});

	describe("isModelForProvider", () => {
		test("should correctly identify OpenAI models", () => {
			expect(isModelForProvider("gpt-4o", "OPENAI")).toBe(true);
			expect(isModelForProvider("gpt-4o-mini", "OPENAI")).toBe(true);
			expect(isModelForProvider("claude-3-opus-20240229", "OPENAI")).toBe(
				false,
			);
		});

		test("should correctly identify Anthropic models", () => {
			expect(isModelForProvider("claude-3-opus-20240229", "ANTHROPIC")).toBe(
				true,
			);
			expect(isModelForProvider("claude-3-5-haiku-20241022", "ANTHROPIC")).toBe(
				true,
			);
			expect(isModelForProvider("gpt-4o", "ANTHROPIC")).toBe(false);
		});

		test("should correctly identify Google models", () => {
			expect(isModelForProvider("gemini-2.5-pro", "GOOGLE")).toBe(true);
			expect(isModelForProvider("gemini-1.5-flash", "GOOGLE")).toBe(true);
			expect(isModelForProvider("gpt-4o", "GOOGLE")).toBe(false);
			expect(isModelForProvider("claude-3-opus-20240229", "GOOGLE")).toBe(
				false,
			);
		});

		test("should handle unknown models", () => {
			expect(isModelForProvider("unknown-model", "OPENAI")).toBe(false);
			expect(isModelForProvider("unknown-model", "ANTHROPIC")).toBe(false);
			expect(isModelForProvider("unknown-model", "GOOGLE")).toBe(false);
		});
	});

	describe("getProviderForModel", () => {
		test("should return correct provider for models", () => {
			expect(getProviderForModel("gpt-4o")).toBe("OPENAI");
			expect(getProviderForModel("gpt-4o-mini")).toBe("OPENAI");
			expect(getProviderForModel("o1-pro")).toBe("OPENAI");
			expect(getProviderForModel("claude-3-opus-20240229")).toBe("ANTHROPIC");
			expect(getProviderForModel("claude-3-5-haiku-20241022")).toBe(
				"ANTHROPIC",
			);
			expect(getProviderForModel("gemini-2.5-pro")).toBe("GOOGLE");
			expect(getProviderForModel("gemini-1.5-flash")).toBe("GOOGLE");
			expect(getProviderForModel("text-embedding-004")).toBe("GOOGLE");
		});

		test("should return null for unknown models", () => {
			expect(getProviderForModel("unknown-model" as Model)).toBe(null);
		});
	});

	describe("isValidModel", () => {
		test("should validate known models", () => {
			expect(isValidModel("gpt-4o")).toBe(true);
			expect(isValidModel("gpt-4o-mini")).toBe(true);
			expect(isValidModel("claude-3-opus-20240229")).toBe(true);
			expect(isValidModel("claude-3-5-haiku-20241022")).toBe(true);
			expect(isValidModel("gemini-2.5-pro")).toBe(true);
			expect(isValidModel("gemini-1.5-flash")).toBe(true);
			expect(isValidModel("text-embedding-004")).toBe(true);
		});

		test("should reject unknown models", () => {
			expect(isValidModel("gpt-5")).toBe(false);
			expect(isValidModel("claude-4")).toBe(false);
			expect(isValidModel("unknown-model")).toBe(false);
			expect(isValidModel("")).toBe(false);
		});
	});

	describe("getModelOptions", () => {
		test("should return all models when no provider specified", () => {
			const options = getModelOptions();
			expect(options.length).toBe(ALL_MODELS.length);

			// Check structure
			const firstOption = options[0];
			expect(firstOption).toHaveProperty("value");
			expect(firstOption).toHaveProperty("label");
			expect(firstOption).toHaveProperty("provider");
			expect(firstOption).toHaveProperty("order");
		});

		test("should return filtered models for specific provider", () => {
			const openaiOptions = getModelOptions("OPENAI");
			const anthropicOptions = getModelOptions("ANTHROPIC");
			const googleOptions = getModelOptions("GOOGLE");

			expect(openaiOptions.every((opt) => !("provider" in opt))).toBe(true);
			expect(anthropicOptions.every((opt) => !("provider" in opt))).toBe(true);
			expect(googleOptions.every((opt) => !("provider" in opt))).toBe(true);

			// Verify counts match
			expect(openaiOptions.length).toBe(Object.keys(MODELS.OPENAI).length);
			expect(anthropicOptions.length).toBe(
				Object.keys(MODELS.ANTHROPIC).length,
			);
			expect(googleOptions.length).toBe(Object.keys(MODELS.GOOGLE).length);
		});

		test("should sort models correctly", () => {
			const options = getModelOptions("OPENAI");

			// Check that they're sorted by order
			for (let i = 1; i < options.length; i++) {
				expect(options[i].order).toBeGreaterThanOrEqual(options[i - 1].order);
			}
		});

		test("should include badges in options", () => {
			const options = getModelOptions("OPENAI");
			const newModel = options.find((opt) => opt.value === "gpt-4.1");
			const previewModel = options.find(
				(opt) => opt.value === "gpt-4.5-preview",
			);

			expect(newModel?.badge).toBe("new");
			expect(previewModel?.badge).toBe("preview");
		});
	});

	describe("ALL_MODELS", () => {
		test("should contain all models from all providers", () => {
			const openaiCount = Object.keys(MODELS.OPENAI).length;
			const anthropicCount = Object.keys(MODELS.ANTHROPIC).length;
			const googleCount = Object.keys(MODELS.GOOGLE).length;
			expect(ALL_MODELS.length).toBe(
				openaiCount + anthropicCount + googleCount,
			);
		});

		test("should have correct structure", () => {
			for (const model of ALL_MODELS) {
				expect(model).toHaveProperty("provider");
				expect(model).toHaveProperty("model");
				expect(model).toHaveProperty("displayName");
				expect(model).toHaveProperty("order");
				expect(["OPENAI", "ANTHROPIC", "GOOGLE"]).toContain(model.provider);
			}
		});
	});

	describe("MODEL_VALUES", () => {
		test("should contain all model IDs", () => {
			expect(MODEL_VALUES.length).toBe(ALL_MODELS.length);
			expect(MODEL_VALUES).toContain("gpt-4o");
			expect(MODEL_VALUES).toContain("claude-3-opus-20240229");
			expect(MODEL_VALUES).toContain("gemini-2.5-pro");
			expect(MODEL_VALUES).toContain("gemini-1.5-flash");
		});

		test("should not contain duplicates", () => {
			const uniqueModels = new Set(MODEL_VALUES);
			expect(uniqueModels.size).toBe(MODEL_VALUES.length);
		});
	});

	describe("Model completeness", () => {
		test("all OpenAI models should have pricing", async () => {
			// Import pricing to verify all models have pricing
			const { getModelPricing } = await import("../pricing");

			for (const model of Object.keys(MODELS.OPENAI) as Model[]) {
				const pricing = getModelPricing("OPENAI", model);
				expect(pricing).toBeDefined();
				expect(pricing.prompt).toBeGreaterThan(0);
				expect(pricing.completion).toBeGreaterThan(0);
			}
		});

		test("all Anthropic models should have pricing", async () => {
			const { getModelPricing } = await import("../pricing");

			for (const model of Object.keys(MODELS.ANTHROPIC) as Model[]) {
				const pricing = getModelPricing("ANTHROPIC", model);
				expect(pricing).toBeDefined();
				expect(pricing.prompt).toBeGreaterThan(0);
				expect(pricing.completion).toBeGreaterThan(0);
			}
		});

		test("all Google models should have pricing", async () => {
			const { getModelPricing } = await import("../pricing");

			for (const model of Object.keys(MODELS.GOOGLE) as Model[]) {
				const pricing = getModelPricing("GOOGLE", model);
				expect(pricing).toBeDefined();
				expect(pricing.prompt).toBeGreaterThan(0);

				// Embedding models have 0 completion cost which is expected
				if (model.includes("embedding")) {
					expect(pricing.completion).toBe(0);
				} else {
					expect(pricing.completion).toBeGreaterThan(0);
				}
			}
		});
	});
});
