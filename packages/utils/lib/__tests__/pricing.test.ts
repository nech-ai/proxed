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

			// gpt-4o-mini: 0.00015 per 1M tokens (prompt), 0.0006 per 1M tokens (completion)
			// 1M tokens: 1 * 0.00015 = 0.00015
			// 500K tokens: 0.5 * 0.0006 = 0.0003
			expect(result.promptCost).toBe(0.00015);
			expect(result.completionCost).toBe(0.0003);
			expect(result.totalCost).toBe(0.00045);
		});

		test("should calculate costs correctly for Anthropic models", () => {
			const result = calculateCosts({
				provider: "ANTHROPIC",
				model: "claude-3-5-haiku-20241022",
				promptTokens: 2000000, // 2M tokens
				completionTokens: 1000000, // 1M tokens
			});

			// claude-3-5-haiku: 0.0008 per 1M prompt, 0.004 per 1M completion
			// 2M tokens: 2 * 0.0008 = 0.0016
			// 1M tokens: 1 * 0.004 = 0.004
			expect(result.promptCost).toBe(0.0016);
			expect(result.completionCost).toBe(0.004);
			expect(result.totalCost).toBe(0.0056);
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

			// 1045 / 1,000,000 * 0.00015 = 0.00000015675
			expect(result.promptCost).toBeCloseTo(0.00000015675, 10);
			expect(result.completionCost).toBe(0);
			expect(result.totalCost).toBeCloseTo(0.00000015675, 10);
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

			// o1: 0.015 per 1M prompt, 0.06 per 1M completion
			// 10K tokens: 0.01 * 0.015 = 0.00015
			// 5K tokens: 0.005 * 0.06 = 0.0003
			expect(result.promptCost).toBe(0.00015);
			expect(result.completionCost).toBe(0.0003);
			expect(result.totalCost).toBeCloseTo(0.00045, 10);
		});

		test("should handle large token counts", () => {
			const result = calculateCosts({
				provider: "ANTHROPIC",
				model: "claude-4-opus-20250514",
				promptTokens: 10000000, // 10M tokens
				completionTokens: 5000000, // 5M tokens
			});

			// claude-4-opus: 0.015 per 1M prompt, 0.075 per 1M completion
			// 10M tokens: 10 * 0.015 = 0.15
			// 5M tokens: 5 * 0.075 = 0.375
			expect(result.promptCost).toBe(0.15);
			expect(result.completionCost).toBe(0.375);
			expect(result.totalCost).toBe(0.525);
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

				test("Google Imagen returns 0 (not priced here)", () => {
					expect(
						calculateImageGenerationCost({
							provider: "GOOGLE",
							model: "imagen-3.0-generate-002",
							size: "1024x1024",
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

			// gpt-4o: 0.0025 per 1M prompt, 0.01 per 1M completion
			// 100K tokens: 0.1 * 0.0025 = 0.00025
			// 50K tokens: 0.05 * 0.01 = 0.0005
			expect(result.promptCost).toBe("0.000250");
			expect(result.completionCost).toBe("0.000500");
			expect(result.totalCost).toBe("0.000750");
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

			// 1045 / 1,000,000 * 0.00015 = 0.00000015675
			// This is less than 0.000001, so it gets formatted as minimum value
			expect(result.promptCost).toBe("0.000001");
			expect(result.completionCost).toBe("0");
			expect(result.totalCost).toBe("0.000001");
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

			// o1: 0.015 per 1M prompt, 0.06 per 1M completion
			// 10M tokens: 10 * 0.015 = 0.15
			// 10M tokens: 10 * 0.06 = 0.6
			expect(result.promptCost).toBe("0.150000");
			expect(result.completionCost).toBe("0.600000");
			expect(result.totalCost).toBe("0.750000");
		});
	});

	describe("getModelPricing", () => {
		test("should return correct pricing for OpenAI models", () => {
			const pricing = getModelPricing("OPENAI", "gpt-4o-mini");
			expect(pricing).toEqual({
				prompt: 0.00015,
				completion: 0.0006,
			});
		});

		test("should return correct pricing for Anthropic models", () => {
			const pricing = getModelPricing("ANTHROPIC", "claude-3-5-haiku-20241022");
			expect(pricing).toEqual({
				prompt: 0.0008,
				completion: 0.004,
			});
		});

		test("should return correct pricing for Google models", () => {
			const pricing = getModelPricing("GOOGLE", "gemini-2.5-pro");
			expect(pricing).toEqual({
				prompt: 1.25,
				completion: 5,
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
				prompt: 0.03,
				completion: 0.06,
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
			// gpt-4o: 0.0025 per 1M prompt, 0.01 per 1M completion
			expect(result.promptCost).toBe(-0.0000025);
			expect(result.completionCost).toBe(0.00002);
			expect(result.totalCost).toBeCloseTo(0.0000175, 10);
		});

		test("should handle all latest model variants", () => {
			const testCases: Array<[Provider, Model, number, number]> = [
				["OPENAI", "gpt-4.1", 0.002, 0.008],
				["OPENAI", "gpt-4o-audio-preview", 0.0025, 0.01],
				["OPENAI", "o3-mini", 0.0011, 0.0044],
				["ANTHROPIC", "claude-4-opus-20250514", 0.015, 0.075],
				["ANTHROPIC", "claude-3-7-sonnet-20250219", 0.003, 0.015],
				["GOOGLE", "gemini-2.5-flash", 0.075, 0.3],
				["GOOGLE", "gemini-2.0-flash", 0.075, 0.3],
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

			// gpt-4o-mini: 0.00015 per 1M prompt, 0.0006 per 1M completion
			// Total prompt tokens: 1045, completion tokens: 755
			// (1045 / 1M * 0.00015) + (755 / 1M * 0.0006) = 0.00000015675 + 0.000000453 = 0.00000060975
			expect(totalCost).toBeCloseTo(0.00000060975, 10);
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
			// Default OpenAI: 0.003 per 1M prompt, 0.006 per 1M completion
			expect(result.promptCost).toBe(0.003);
			expect(result.completionCost).toBe(0.003); // 0.5 * 0.006 = 0.003
			expect(result.totalCost).toBe(0.006);
		});
	});
});
