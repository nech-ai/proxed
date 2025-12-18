import type {
	Provider,
	Model,
	OpenAIModel,
	AnthropicModel,
	GoogleModel,
} from "./providers";
import { getModelOptions } from "./providers";

type ModelPricing = {
	prompt: number;
	completion: number;
};

const OPENAI_MODELS: Record<OpenAIModel, ModelPricing> = {
	// GPT-5.2
	"gpt-5.2-pro": {
		prompt: 21, // $21.00 / 1M input tokens
		completion: 168, // $168.00 / 1M output tokens
	},
	"gpt-5.2-chat-latest": {
		prompt: 1.75, // $1.75 / 1M input tokens
		completion: 14, // $14.00 / 1M output tokens
	},
	"gpt-5.2": {
		prompt: 1.75, // $1.75 / 1M input tokens
		completion: 14, // $14.00 / 1M output tokens
	},

	// GPT-5.1
	"gpt-5.1-chat-latest": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"gpt-5.1": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},

	// GPT-5
	"gpt-5": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"gpt-5-chat-latest": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"gpt-5-pro": {
		prompt: 21, // $21.00 / 1M input tokens
		completion: 168, // $168.00 / 1M output tokens
	},
	"gpt-5-mini": {
		prompt: 0.25, // $0.25 / 1M input tokens
		completion: 2, // $2.00 / 1M output tokens
	},
	"gpt-5-nano": {
		prompt: 0.05, // $0.05 / 1M input tokens
		completion: 0.4, // $0.40 / 1M output tokens
	},

	// Codex
	"gpt-5.1-codex-max": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"gpt-5.1-codex": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"gpt-5.1-codex-mini": {
		prompt: 0.25, // $0.25 / 1M input tokens
		completion: 2, // $2.00 / 1M output tokens
	},
	"gpt-5-codex": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"codex-mini-latest": {
		prompt: 1.5, // $1.50 / 1M input tokens
		completion: 6, // $6.00 / 1M output tokens
	},

	// GPT-4.1 series
	"gpt-4.1": {
		prompt: 2, // $2.00 / 1M input tokens
		completion: 8, // $8.00 / 1M output tokens
	},
	"gpt-4.1-mini": {
		prompt: 0.4, // $0.40 / 1M input tokens
		completion: 1.6, // $1.60 / 1M output tokens
	},
	"gpt-4.1-nano": {
		prompt: 0.1, // $0.10 / 1M input tokens
		completion: 0.4, // $0.40 / 1M output tokens
	},

	// GPT-4o series
	"gpt-4o": {
		prompt: 2.5, // $2.50 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"gpt-4o-mini": {
		prompt: 0.15, // $0.15 / 1M input tokens
		completion: 0.6, // $0.60 / 1M output tokens
	},

	// GPT-4 series
	"gpt-4-turbo": {
		prompt: 10, // $10.00 / 1M input tokens
		completion: 30, // $30.00 / 1M output tokens
	},
	"gpt-4": {
		prompt: 30, // $30.00 / 1M input tokens
		completion: 60, // $60.00 / 1M output tokens
	},
	"gpt-3.5-turbo": {
		prompt: 0.5, // $0.50 / 1M input tokens
		completion: 1.5, // $1.50 / 1M output tokens
	},

	// o1 series
	"o1-pro": {
		prompt: 150, // $150.00 / 1M input tokens
		completion: 600, // $600.00 / 1M output tokens
	},
	o1: {
		prompt: 15, // $15.00 / 1M input tokens
		completion: 60, // $60.00 / 1M output tokens
	},
	"o1-mini": {
		prompt: 1.1, // $1.10 / 1M input tokens
		completion: 4.4, // $4.40 / 1M output tokens
	},
	"o1-preview": {
		prompt: 15, // Deprecated alias: treat as o1 pricing
		completion: 60,
	},

	// o3 series
	"o3-pro": {
		prompt: 20, // $20.00 / 1M input tokens
		completion: 80, // $80.00 / 1M output tokens
	},
	o3: {
		prompt: 2, // $2.00 / 1M input tokens
		completion: 8, // $8.00 / 1M output tokens
	},
	"o3-mini": {
		prompt: 1.1, // $1.10 / 1M input tokens
		completion: 4.4, // $4.40 / 1M output tokens
	},
	"o3-deep-research": {
		prompt: 10, // $10.00 / 1M input tokens
		completion: 40, // $40.00 / 1M output tokens
	},

	// o4 series
	"o4-mini": {
		prompt: 1.1, // $1.10 / 1M input tokens
		completion: 4.4, // $4.40 / 1M output tokens
	},
	"o4-mini-deep-research": {
		prompt: 2, // $2.00 / 1M input tokens
		completion: 8, // $8.00 / 1M output tokens
	},

	// ChatGPT models
	"chatgpt-4o-latest": {
		prompt: 2.5, // Treat as GPT-4o pricing
		completion: 10,
	},

	// Image generation models (token pricing varies by modality; this table is not used for /v1/image costs)
	"gpt-image-1": {
		prompt: 5, // $5.00 / 1M text input tokens
		completion: 0,
	},
	"gpt-image-1.5": {
		prompt: 5, // $5.00 / 1M text input tokens
		completion: 10, // $10.00 / 1M text output tokens
	},
	"gpt-image-1-mini": {
		prompt: 2.5, // $2.50 / 1M text input tokens
		completion: 8, // $8.00 / 1M text output tokens
	},
	"chatgpt-image-latest": {
		prompt: 5, // $5.00 / 1M text input tokens
		completion: 10, // $10.00 / 1M text output tokens
	},
	"dall-e-3": {
		prompt: 0,
		completion: 0,
	},
	"dall-e-2": {
		prompt: 0,
		completion: 0,
	},
};

const ANTHROPIC_MODELS: Record<AnthropicModel, ModelPricing> = {
	// Claude 4.5 models
	"claude-opus-4-5": {
		prompt: 5, // $5.00 / 1M input tokens
		completion: 25, // $25.00 / 1M output tokens
	},
	"claude-sonnet-4-5": {
		prompt: 3, // $3.00 / 1M input tokens
		completion: 15, // $15.00 / 1M output tokens
	},
	"claude-haiku-4-5": {
		prompt: 1, // $1.00 / 1M input tokens
		completion: 5, // $5.00 / 1M output tokens
	},

	// Claude 4.x
	"claude-opus-4-1": {
		prompt: 15, // $15.00 / 1M input tokens
		completion: 75, // $75.00 / 1M output tokens
	},
	"claude-opus-4-0": {
		prompt: 15, // $15.00 / 1M input tokens
		completion: 75, // $75.00 / 1M output tokens
	},
	"claude-sonnet-4-0": {
		prompt: 3, // $3.00 / 1M input tokens
		completion: 15, // $15.00 / 1M output tokens
	},

	// Claude 4 (snapshot ids)
	"claude-opus-4-20250514": {
		prompt: 15, // $15.00 / 1M input tokens
		completion: 75, // $75.00 / 1M output tokens
	},
	"claude-sonnet-4-20250514": {
		prompt: 3, // $3.00 / 1M input tokens
		completion: 15, // $15.00 / 1M output tokens
	},

	// Claude 3.7 Sonnet models
	"claude-3-7-sonnet-20250219": {
		prompt: 3, // $3.00 / 1M input tokens
		completion: 15, // $15.00 / 1M output tokens
	},

	// Claude 3.5 models
	"claude-3-5-sonnet-20241022": {
		prompt: 3, // $3.00 / 1M input tokens
		completion: 15, // $15.00 / 1M output tokens
	},
	"claude-3-5-sonnet-20240620": {
		prompt: 3, // $3.00 / 1M input tokens
		completion: 15, // $15.00 / 1M output tokens
	},
	"claude-3-5-haiku-20241022": {
		prompt: 0.8, // $0.80 / 1M input tokens
		completion: 4, // $4.00 / 1M output tokens
	},

	// Claude 3 models
	"claude-3-opus-20240229": {
		prompt: 15, // $15.00 / 1M input tokens
		completion: 75, // $75.00 / 1M output tokens
	},
	"claude-3-sonnet-20240229": {
		prompt: 3, // $3.00 / 1M input tokens
		completion: 15, // $15.00 / 1M output tokens
	},
	"claude-3-haiku-20240307": {
		prompt: 0.25, // $0.25 / 1M input tokens
		completion: 1.25, // $1.25 / 1M output tokens
	},
};

const GOOGLE_MODELS: Record<GoogleModel, ModelPricing> = {
	// Gemini 3 (preview)
	"gemini-3-pro-preview": {
		prompt: 2, // $2.00 / 1M input tokens (≤200k context)
		completion: 12, // $12.00 / 1M output tokens (≤200k context)
	},
	"gemini-3-flash-preview": {
		prompt: 0.5, // $0.50 / 1M input tokens (text)
		completion: 3, // $3.00 / 1M output tokens
	},
	"gemini-3-pro-image-preview": {
		prompt: 2, // $2.00 / 1M input tokens (≤200k context)
		completion: 12, // $12.00 / 1M output tokens (≤200k context)
	},

	// Gemini 2.5 series
	"gemini-2.5-pro": {
		prompt: 1.25, // $1.25 / 1M input tokens
		completion: 10, // $10.00 / 1M output tokens
	},
	"gemini-2.5-flash": {
		prompt: 0.3, // $0.30 / 1M input tokens
		completion: 2.5, // $2.50 / 1M output tokens
	},
	"gemini-2.5-flash-lite": {
		prompt: 0.1, // $0.10 / 1M input tokens
		completion: 0.4, // $0.40 / 1M output tokens
	},

	// Gemini 2.0 series
	"gemini-2.0-flash": {
		prompt: 0.1, // $0.10 / 1M input tokens
		completion: 0.4, // $0.40 / 1M output tokens
	},
	"gemini-2.0-flash-lite": {
		prompt: 0.075, // Estimated (Lite tier)
		completion: 0.3,
	},
	"gemini-2.0-flash-exp": {
		prompt: 0.1, // Treat as Gemini 2.0 Flash pricing
		completion: 0.4,
	},

	// Gemini 1.5 series
	"gemini-1.5-pro": {
		prompt: 1.25, // $1.25 / 1M input tokens (≤128k)
		completion: 5, // $5.00 / 1M output tokens (≤128k)
	},
	"gemini-1.5-flash": {
		prompt: 0.075, // $0.075 / 1M input tokens (≤128k)
		completion: 0.3, // $0.30 / 1M output tokens (≤128k)
	},
	"gemini-1.5-flash-8b": {
		prompt: 0.0375, // $0.0375 / 1M input tokens (≤128k)
		completion: 0.15, // $0.15 / 1M output tokens (≤128k)
	},

	// Image generation model (token pricing not applicable)
	"imagen-4.0-generate-001": {
		prompt: 0,
		completion: 0,
	},
	"imagen-4.0-fast-generate-001": {
		prompt: 0,
		completion: 0,
	},
	"imagen-4.0-ultra-generate-001": {
		prompt: 0,
		completion: 0,
	},
};

const PROVIDER_MODELS = {
	OPENAI: OPENAI_MODELS,
	ANTHROPIC: ANTHROPIC_MODELS,
	GOOGLE: GOOGLE_MODELS,
} as const;

// Default pricing fallbacks for unknown models
const DEFAULT_OPENAI_PRICING: ModelPricing = {
	prompt: 2.5, // Default to GPT-4o input pricing
	completion: 10, // Default to GPT-4o output pricing
};

const DEFAULT_ANTHROPIC_PRICING: ModelPricing = {
	prompt: 3, // Default to Sonnet-tier pricing
	completion: 15,
};

const DEFAULT_GOOGLE_PRICING: ModelPricing = {
	prompt: 0.3, // Default to Gemini Flash-tier input pricing
	completion: 2.5,
};

function getModelPricingWithFallback(
	provider: Provider,
	model: string,
): ModelPricing {
	if (provider === "OPENAI") {
		// Check if it's a known model
		if (model in OPENAI_MODELS) {
			return OPENAI_MODELS[model as OpenAIModel];
		}

		// Default OpenAI pricing for unknown models
		return DEFAULT_OPENAI_PRICING;
	}

	if (provider === "ANTHROPIC") {
		// Check if it's a known model
		if (model in ANTHROPIC_MODELS) {
			return ANTHROPIC_MODELS[model as AnthropicModel];
		}

		// Default Anthropic pricing
		return DEFAULT_ANTHROPIC_PRICING;
	}

	if (provider === "GOOGLE") {
		// Check if it's a known model
		if (model in GOOGLE_MODELS) {
			return GOOGLE_MODELS[model as GoogleModel];
		}

		// Default Google pricing
		return DEFAULT_GOOGLE_PRICING;
	}

	// Fallback for any unknown provider
	return DEFAULT_OPENAI_PRICING;
}

export function calculateCosts(params: {
	provider: Provider;
	model: Model | string; // Allow string for flexibility
	promptTokens: number;
	completionTokens: number;
}) {
	const { provider, model, promptTokens, completionTokens } = params;
	const pricing = getModelPricingWithFallback(provider, model);

	// Pricing is per 1M tokens, so divide by 1,000,000
	const promptCost = (promptTokens / 1_000_000) * pricing.prompt;
	const completionCost = (completionTokens / 1_000_000) * pricing.completion;
	const totalCost = promptCost + completionCost;

	return {
		promptCost,
		completionCost,
		totalCost,
	};
}

export function getModelPricing(
	provider: Provider,
	model: Model,
): ModelPricing {
	if (provider === "OPENAI") {
		return OPENAI_MODELS[model as OpenAIModel];
	}
	if (provider === "ANTHROPIC") {
		return ANTHROPIC_MODELS[model as AnthropicModel];
	}
	if (provider === "GOOGLE") {
		return GOOGLE_MODELS[model as GoogleModel];
	}
	// Fallback, should not happen with proper typing
	return DEFAULT_OPENAI_PRICING;
}

function formatUsd(value: number): string {
	if (value >= 1) return `$${value.toFixed(2)}`;

	// Keep 2 decimals for common sub-$1 prices (e.g. 0.30 -> 0.30, 0.10 -> 0.10)
	if (value >= 0.1) return `$${value.toFixed(2)}`;

	// Otherwise allow up to 4 decimals and trim trailing zeros (e.g. 0.0750 -> 0.075)
	const fixed = value.toFixed(4);
	const trimmed = fixed.replace(/0+$/, "").replace(/\.$/, "");
	return `$${trimmed}`;
}

export function formatTokenPricingLabel(pricing: ModelPricing): string | null {
	if (pricing.prompt === 0 && pricing.completion === 0) return null;

	const input = formatUsd(pricing.prompt);
	const output = formatUsd(pricing.completion);
	return `In ${input} · Out ${output} / 1M`;
}

export function getModelOptionsWithPricing(provider?: Provider) {
	if (provider) {
		return getModelOptions(provider).map((option) => {
			const pricing = getModelPricingWithFallback(provider, option.value);
			return {
				...option,
				pricing,
				pricingLabel: formatTokenPricingLabel(pricing),
			};
		});
	}

	return getModelOptions().map((option) => {
		const pricing = getModelPricingWithFallback(option.provider, option.value);
		return {
			...option,
			pricing,
			pricingLabel: formatTokenPricingLabel(pricing),
		};
	});
}

/**
 * Helper function to format costs for database storage
 * Returns string values with 6 decimal places
 */
export function formatCostsForDB(params: {
	provider: Provider;
	model: Model | string;
	promptTokens: number;
	completionTokens: number;
}) {
	const costs = calculateCosts(params);

	// Use more decimal places for very small amounts
	const formatCost = (cost: number): string => {
		if (cost === 0) return "0";
		// Always use at least 6 decimals, but ensure we don't lose precision for small values
		// Database supports numeric(10,6) so we can't exceed 6 decimal places
		const formatted = cost.toFixed(6);
		// If the formatted value is "0.000000" but cost is not zero, use the minimum representable value
		if (formatted === "0.000000" && cost > 0) {
			return "0.000001"; // Minimum value that can be stored with 6 decimal places
		}
		return formatted;
	};

	return {
		promptCost: formatCost(costs.promptCost),
		completionCost: formatCost(costs.completionCost),
		totalCost: formatCost(costs.totalCost),
	};
}

// MARK: Image generation pricing (per image)

type ImageSizeKey = "1024x1024" | "1024x1536" | "1536x1024";

// Normalize size/aspectRatio to one of the known pricing buckets
function normalizeImageSize(
	size?: string,
	aspectRatio?: string,
): ImageSizeKey | null {
	if (size) {
		const normalized = size.trim();
		if (
			normalized === "1024x1024" ||
			normalized === "1024x1536" ||
			normalized === "1536x1024"
		) {
			return normalized as ImageSizeKey;
		}
	}

	if (aspectRatio) {
		const ar = aspectRatio.trim();
		if (ar === "1:1") return "1024x1024";
		if (ar === "2:3") return "1024x1536";
		if (ar === "3:2") return "1536x1024";
	}

	return null;
}

function toFixed6(n: number): string {
	if (!Number.isFinite(n) || n <= 0) return "0.000000";
	const formatted = n.toFixed(6);
	return formatted === "0.000000" ? "0.000001" : formatted;
}

/**
 * Calculate total cost for image generation requests.
 * Returns the total dollar amount for n images based on model, size, and quality.
 * Currently supports OpenAI image models. Google Imagen pricing is not defined here and returns 0.
 */
export function calculateImageGenerationCost(params: {
	provider: Provider;
	model: string;
	size?: string;
	aspectRatio?: string;
	quality?: string; // e.g., "low" | "medium" | "high" | "standard" | "hd"
	n?: number;
}): number {
	const { provider, model, size, aspectRatio, quality, n = 1 } = params;
	const count = Math.max(1, n | 0);
	const sizeKey = normalizeImageSize(size, aspectRatio);

	// Google Imagen pricing is per output image (as published by Google).
	if (provider === "GOOGLE") {
		if (model === "imagen-4.0-generate-001") return 0.04 * count;
		if (model === "imagen-4.0-fast-generate-001") return 0.02 * count;
		// Imagen 4 Ultra pricing isn't published separately in our pricing table.
		return 0;
	}

	// Only defined for OpenAI image models beyond this point
	if (provider !== "OPENAI") return 0;

	// Normalize quality labels across models
	const q = (quality || "").toLowerCase();
	// For GPT Image 1, use low/medium/high. Map common synonyms.
	const normalizedQualityForGptImage1: "low" | "medium" | "high" =
		q === "low" ? "low" : q === "high" || q === "hd" ? "high" : "medium"; // default

	// For DALL·E 3 use standard or hd; map medium->standard, high->hd
	const normalizedQualityForDalle3: "standard" | "hd" =
		q === "hd" || q === "high" ? "hd" : "standard";

	if (model === "gpt-image-1") {
		if (!sizeKey) return 0;
		const table: Record<
			"low" | "medium" | "high",
			Record<ImageSizeKey, number>
		> = {
			low: {
				"1024x1024": 0.011,
				"1024x1536": 0.016,
				"1536x1024": 0.016,
			},
			medium: {
				"1024x1024": 0.042,
				"1024x1536": 0.063,
				"1536x1024": 0.063,
			},
			high: {
				"1024x1024": 0.167,
				"1024x1536": 0.25,
				"1536x1024": 0.25,
			},
		};
		return table[normalizedQualityForGptImage1][sizeKey] * count;
	}

	if (model === "dall-e-3") {
		if (!sizeKey) return 0;
		const table: Record<"standard" | "hd", Record<ImageSizeKey, number>> = {
			standard: {
				"1024x1024": 0.04,
				"1024x1536": 0.08,
				"1536x1024": 0.08,
			},
			hd: {
				"1024x1024": 0.08,
				"1024x1536": 0.12,
				"1536x1024": 0.12,
			},
		};
		return table[normalizedQualityForDalle3][sizeKey] * count;
	}

	if (model === "dall-e-2") {
		if (!sizeKey) return 0;
		const table: Record<ImageSizeKey, number> = {
			"1024x1024": 0.016,
			"1024x1536": 0.018,
			"1536x1024": 0.02,
		};
		return table[sizeKey] * count;
	}

	// Unknown image model or provider
	return 0;
}

export function formatImageCostForDB(totalCost: number): {
	promptCost: string;
	completionCost: string;
	totalCost: string;
} {
	const formatted = toFixed6(totalCost);
	return {
		promptCost: formatted,
		completionCost: "0.000000",
		totalCost: formatted,
	};
}
