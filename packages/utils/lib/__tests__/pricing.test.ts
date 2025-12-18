import { describe, test, expect } from "bun:test";
import {
	calculateCosts,
	formatCostsForDB,
	getModelPricing,
	calculateImageGenerationCost,
	formatImageCostForDB,
} from "../pricing";
import type { Provider, Model } from "../providers";

describe("Pricing and Cost Calculation", () => {
	describe("calculateCosts", () => {
		test("should calculate costs correctly for OpenAI models", () => {
			const result = calculateCosts({
				provider: "OPENAI",
				model: "gpt-4o-mini",
				promptTokens: 1000000, // 1M tokens
				completionTokens: 500000, // 500K tokens
			});

			// gpt-4o-mini: $0.15 / $0.60 per 1M tokens (input/output)
			// 1M tokens: 1 * 0.15 = 0.15
			// 500K tokens: 0.5 * 0.60 = 0.30
			expect(result.promptCost).toBe(0.15);
			expect(result.completionCost).toBe(0.3);
			expect(result.totalCost).toBeCloseTo(0.45, 10);
		});

		test("should calculate costs correctly for Anthropic models", () => {
			const result = calculateCosts({
				provider: "ANTHROPIC",
				model: "claude-3-5-haiku-20241022",
				promptTokens: 2000000, // 2M tokens
				completionTokens: 1000000, // 1M tokens
			});

			// claude-3-5-haiku: $0.80 / $4.00 per 1M tokens (input/output)
			// 2M tokens: 2 * 0.80 = 1.60
			// 1M tokens: 1 * 4.00 = 4.00
			expect(result.promptCost).toBe(1.6);
			expect(result.completionCost).toBe(4);
			expect(result.totalCost).toBe(5.6);
		});

		test("should calculate costs correctly for Google models", () => {
			const result = calculateCosts({
				provider: "GOOGLE",
				model: "gemini-1.5-flash",
				promptTokens: 2000000, // 2M tokens
				completionTokens: 1000000, // 1M tokens
			});

			// gemini-1.5-flash: 0.075 per 1M prompt, 0.3 per 1M completion
			// 2M tokens: 2 * 0.075 = 0.15
			// 1M tokens: 1 * 0.3 = 0.3
			expect(result.promptCost).toBe(0.15);
			expect(result.completionCost).toBe(0.3);
			expect(result.totalCost).toBeCloseTo(0.45, 10);
		});

		test("should handle Google models", () => {
			const result = calculateCosts({
				provider: "GOOGLE",
				model: "gemini-1.5-flash",
				promptTokens: 1000000, // 1M tokens
				completionTokens: 500000, // 500K tokens
			});

			// gemini-1.5-flash: 0.075 per 1M prompt, 0.3 per 1M completion
			expect(result.promptCost).toBe(0.075);
			expect(result.completionCost).toBe(0.15); // 0.5 * 0.3
			expect(result.totalCost).toBeCloseTo(0.225, 10);
		});

		test("should handle very small token counts", () => {
			const result = calculateCosts({
				provider: "OPENAI",
				model: "gpt-4o-mini",
				promptTokens: 1045,
				completionTokens: 0,
			});

			// 1045 / 1,000,000 * 0.15 = 0.00015675
			expect(result.promptCost).toBeCloseTo(0.00015675, 10);
			expect(result.completionCost).toBe(0);
			expect(result.totalCost).toBeCloseTo(0.00015675, 10);
		});

		test("should handle zero tokens", () => {
			const result = calculateCosts({
				provider: "OPENAI",
				model: "gpt-4o",
				promptTokens: 0,
				completionTokens: 0,
			});

			expect(result.promptCost).toBe(0);
			expect(result.completionCost).toBe(0);
			expect(result.totalCost).toBe(0);
		});

		test("should calculate costs for expensive models", () => {
			const result = calculateCosts({
				provider: "OPENAI",
				model: "o1",
				promptTokens: 10000,
				completionTokens: 5000,
			});

			// o1: $15 / $60 per 1M tokens (input/output)
			// 10K tokens: 0.01 * 15 = 0.15
			// 5K tokens: 0.005 * 60 = 0.30
			expect(result.promptCost).toBe(0.15);
			expect(result.completionCost).toBe(0.3);
			expect(result.totalCost).toBeCloseTo(0.45, 10);
		});

		test("should handle large token counts", () => {
			const result = calculateCosts({
				provider: "ANTHROPIC",
				model: "claude-opus-4-20250514",
				promptTokens: 10000000, // 10M tokens
				completionTokens: 5000000, // 5M tokens
			});

			// Claude Opus 4: $15 / $75 per 1M tokens (input/output)
			// 10M tokens: 10 * 15 = 150
			// 5M tokens: 5 * 75 = 375
			expect(result.promptCost).toBe(150);
			expect(result.completionCost).toBe(375);
			expect(result.totalCost).toBe(525);
		});
	});

	describe("image generation pricing", () => {
		test("GPT Image 1 low/medium/high by size and count", () => {
			// low, 1024x1024, n=1
			expect(
				calculateImageGenerationCost({
					provider: "OPENAI",
					model: "gpt-image-1",
					size: "1024x1024",
					quality: "low",
					n: 1,
				}),
			).toBeCloseTo(0.011, 6);

			// Other OpenAI image models don't have per-image pricing defined here.
			for (const unknownModel of [
				"gpt-image-1.5",
				"gpt-image-1-mini",
				"chatgpt-image-latest",
			] as const) {
				expect(
					calculateImageGenerationCost({
						provider: "OPENAI",
						model: unknownModel,
						size: "1024x1024",
						quality: "low",
						n: 1,
					}),
				).toBe(0);
			}

			// high (aka hd), 1024x1536, n=2
			expect(
				calculateImageGenerationCost({
					provider: "OPENAI",
					model: "gpt-image-1",
					size: "1024x1536",
					quality: "hd",
					n: 2,
				}),
			).toBeCloseTo(0.5, 6); // 0.25 * 2

			// aspect ratio with default medium quality
			expect(
				calculateImageGenerationCost({
					provider: "OPENAI",
					model: "gpt-image-1",
					aspectRatio: "1:1",
				}),
			).toBeCloseTo(0.042, 6);
		});

		test("DALL·E 3 standard and HD", () => {
			expect(
				calculateImageGenerationCost({
					provider: "OPENAI",
					model: "dall-e-3",
					size: "1024x1024",
					quality: "standard",
				}),
			).toBeCloseTo(0.04, 6);

			expect(
				calculateImageGenerationCost({
					provider: "OPENAI",
					model: "dall-e-3",
					size: "1536x1024",
					quality: "hd",
				}),
			).toBeCloseTo(0.12, 6);
		});

		test("DALL·E 2 pricing by size", () => {
			expect(
				calculateImageGenerationCost({
					provider: "OPENAI",
					model: "dall-e-2",
					size: "1024x1536",
				}),
			).toBeCloseTo(0.018, 6);
		});

		test("Google Imagen 4 per-image pricing", () => {
			expect(
				calculateImageGenerationCost({
					provider: "GOOGLE",
					model: "imagen-4.0-generate-001",
					size: "1024x1024",
				}),
			).toBeCloseTo(0.04, 6);

			expect(
				calculateImageGenerationCost({
					provider: "GOOGLE",
					model: "imagen-4.0-fast-generate-001",
					n: 3,
				}),
			).toBeCloseTo(0.06, 6); // 0.02 * 3

			// Ultra pricing not defined here yet
			expect(
				calculateImageGenerationCost({
					provider: "GOOGLE",
					model: "imagen-4.0-ultra-generate-001",
				}),
			).toBe(0);
		});

		test("formatImageCostForDB formatting", () => {
			expect(formatImageCostForDB(0.5)).toEqual({
				promptCost: "0.500000",
				completionCost: "0.000000",
				totalCost: "0.500000",
			});

			// Very small → minimum representable
			expect(formatImageCostForDB(0.0000004)).toEqual({
				promptCost: "0.000001",
				completionCost: "0.000000",
				totalCost: "0.000001",
			});
		});
	});

	describe("formatCostsForDB", () => {
		test("should format regular costs with 6 decimal places", () => {
			const result = formatCostsForDB({
				provider: "OPENAI",
				model: "gpt-4o",
				promptTokens: 100000,
				completionTokens: 50000,
			});

			// gpt-4o: $2.50 / $10.00 per 1M tokens (input/output)
			// 100K tokens: 0.1 * 2.5 = 0.25
			// 50K tokens: 0.05 * 10 = 0.5
			expect(result.promptCost).toBe("0.250000");
			expect(result.completionCost).toBe("0.500000");
			expect(result.totalCost).toBe("0.750000");
		});

		test("should handle zero costs", () => {
			const result = formatCostsForDB({
				provider: "OPENAI",
				model: "gpt-4o",
				promptTokens: 0,
				completionTokens: 0,
			});

			expect(result.promptCost).toBe("0");
			expect(result.completionCost).toBe("0");
			expect(result.totalCost).toBe("0");
		});

		test("should handle very small costs with minimum representable value", () => {
			const result = formatCostsForDB({
				provider: "OPENAI",
				model: "gpt-4o-mini",
				promptTokens: 1, // Extremely small
				completionTokens: 1,
			});

			// 1 / 1,000,000 * 0.15 = 0.00000015 (rounds to minimum)
			expect(result.promptCost).toBe("0.000001");
			expect(result.completionCost).toBe("0.000001");
			expect(result.totalCost).toBe("0.000001");
		});

		test("should format small but representable costs correctly", () => {
			const result = formatCostsForDB({
				provider: "OPENAI",
				model: "gpt-4o-mini",
				promptTokens: 1045,
				completionTokens: 0,
			});

			// 1045 / 1,000,000 * 0.15 = 0.00015675
			expect(result.promptCost).toBe("0.000157");
			expect(result.completionCost).toBe("0");
			expect(result.totalCost).toBe("0.000157");
		});

		test("should handle edge case of exactly 0.0000005", () => {
			// This should round to 0.000001
			const result = formatCostsForDB({
				provider: "OPENAI",
				model: "gpt-4o-mini",
				promptTokens: 3.33333, // 3.33333 / 1,000,000 * 0.15 ≈ 0.0000005
				completionTokens: 0,
			});

			expect(result.promptCost).toBe("0.000001");
		});

		test("should format large costs correctly", () => {
			const result = formatCostsForDB({
				provider: "OPENAI",
				model: "o1",
				promptTokens: 10000000,
				completionTokens: 10000000,
			});

			// o1: $15 / $60 per 1M tokens (input/output)
			// 10M tokens: 10 * 15 = 150
			// 10M tokens: 10 * 60 = 600
			expect(result.promptCost).toBe("150.000000");
			expect(result.completionCost).toBe("600.000000");
			expect(result.totalCost).toBe("750.000000");
		});
	});

	describe("getModelPricing", () => {
		test("should return correct pricing for OpenAI models", () => {
			const pricing = getModelPricing("OPENAI", "gpt-4o-mini");
			expect(pricing).toEqual({
				prompt: 0.15,
				completion: 0.6,
			});
		});

		test("should return correct pricing for Anthropic models", () => {
			const pricing = getModelPricing("ANTHROPIC", "claude-3-5-haiku-20241022");
			expect(pricing).toEqual({
				prompt: 0.8,
				completion: 4,
			});
		});

		test("should return correct pricing for Google models", () => {
			const pricing = getModelPricing("GOOGLE", "gemini-2.5-pro");
			expect(pricing).toEqual({
				prompt: 1.25,
				completion: 10,
			});

			const flashPricing = getModelPricing("GOOGLE", "gemini-1.5-flash");
			expect(flashPricing).toEqual({
				prompt: 0.075,
				completion: 0.3,
			});
		});

		test("should return correct pricing for expensive models", () => {
			const pricing = getModelPricing("OPENAI", "gpt-4");
			expect(pricing).toEqual({
				prompt: 30,
				completion: 60,
			});
		});
	});

	describe("Edge cases and special scenarios", () => {
		test("should handle negative tokens (edge case)", () => {
			const result = calculateCosts({
				provider: "OPENAI",
				model: "gpt-4o",
				promptTokens: -1000,
				completionTokens: 2000,
			});

			// Should still calculate (even though negative tokens don't make sense)
			// gpt-4o: $2.50 / $10.00 per 1M tokens (input/output)
			expect(result.promptCost).toBe(-0.0025);
			expect(result.completionCost).toBe(0.02);
			expect(result.totalCost).toBeCloseTo(0.0175, 10);
		});

		test("should handle all latest model variants", () => {
			const testCases: Array<[Provider, Model, number, number]> = [
				["OPENAI", "gpt-5.2", 1.75, 14],
				["OPENAI", "gpt-5", 1.25, 10],
				["OPENAI", "gpt-4.1", 2, 8],
				["OPENAI", "gpt-4o", 2.5, 10],
				["OPENAI", "o3-pro", 20, 80],
				["OPENAI", "o4-mini", 1.1, 4.4],
				["ANTHROPIC", "claude-opus-4-5", 5, 25],
				["ANTHROPIC", "claude-3-7-sonnet-20250219", 3, 15],
				["GOOGLE", "gemini-3-pro-preview", 2, 12],
				["GOOGLE", "gemini-2.5-flash", 0.3, 2.5],
				["GOOGLE", "gemini-1.5-flash", 0.075, 0.3],
			];

			for (const [
				provider,
				model,
				expectedPrompt,
				expectedCompletion,
			] of testCases) {
				const pricing = getModelPricing(provider, model);
				expect(pricing.prompt).toBe(expectedPrompt);
				expect(pricing.completion).toBe(expectedCompletion);

				const result = calculateCosts({
					provider,
					model,
					promptTokens: 1000000,
					completionTokens: 1000000,
				});

				expect(result.promptCost).toBeCloseTo(expectedPrompt, 6);
				expect(result.completionCost).toBeCloseTo(expectedCompletion, 6);
			}
		});

		test("should maintain precision for accumulation scenarios", () => {
			// Simulate multiple small requests being accumulated
			const requests = [
				{ promptTokens: 145, completionTokens: 89 },
				{ promptTokens: 234, completionTokens: 156 },
				{ promptTokens: 567, completionTokens: 432 },
				{ promptTokens: 99, completionTokens: 78 },
			];

			let totalCost = 0;
			for (const req of requests) {
				const result = calculateCosts({
					provider: "OPENAI",
					model: "gpt-4o-mini",
					...req,
				});
				totalCost += result.totalCost;
			}

			// gpt-4o-mini: $0.15 / $0.60 per 1M tokens (input/output)
			// Total prompt tokens: 1045, completion tokens: 755
			// (1045 / 1M * 0.15) + (755 / 1M * 0.6) = 0.00015675 + 0.000453 = 0.00060975
			expect(totalCost).toBeCloseTo(0.00060975, 10);
		});

		test("should handle provider-specific string type", () => {
			// Test that string models work (not just Model type)
			const result = calculateCosts({
				provider: "OPENAI",
				model: "future-model-2025",
				promptTokens: 1000000,
				completionTokens: 500000,
			});

			// Should use fallback pricing
			// Default OpenAI: $2.50 / $10.00 per 1M tokens (input/output)
			expect(result.promptCost).toBe(2.5);
			expect(result.completionCost).toBe(5); // 0.5 * 10 = 5
			expect(result.totalCost).toBe(7.5);
		});
	});
});
