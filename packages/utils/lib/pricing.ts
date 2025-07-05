import type {
	Provider,
	Model,
	OpenAIModel,
	AnthropicModel,
	GoogleModel,
} from "./providers";

type ModelPricing = {
	prompt: number;
	completion: number;
};

const OPENAI_MODELS: Record<OpenAIModel, ModelPricing> = {
	// GPT-4.1 series
	"gpt-4.1": {
		prompt: 0.002, // $2.00 per 1M tokens
		completion: 0.008, // $8.00 per 1M tokens
	},
	"gpt-4.1-2025-04-14": {
		prompt: 0.002, // $2.00 per 1M tokens
		completion: 0.008, // $8.00 per 1M tokens
	},
	"gpt-4.1-mini": {
		prompt: 0.0004, // $0.40 per 1M tokens
		completion: 0.0016, // $1.60 per 1M tokens
	},
	"gpt-4.1-mini-2025-04-14": {
		prompt: 0.0004, // $0.40 per 1M tokens
		completion: 0.0016, // $1.60 per 1M tokens
	},
	"gpt-4.1-nano": {
		prompt: 0.0001, // $0.10 per 1M tokens
		completion: 0.0004, // $0.40 per 1M tokens
	},
	"gpt-4.1-nano-2025-04-14": {
		prompt: 0.0001, // $0.10 per 1M tokens
		completion: 0.0004, // $0.40 per 1M tokens
	},

	// GPT-4.5 series
	"gpt-4.5-preview": {
		prompt: 0.075, // $75.00 per 1M tokens
		completion: 0.15, // $150.00 per 1M tokens
	},
	"gpt-4.5-preview-2025-02-27": {
		prompt: 0.075, // $75.00 per 1M tokens
		completion: 0.15, // $150.00 per 1M tokens
	},

	// GPT-4o series
	"gpt-4o": {
		prompt: 0.0025, // $2.50 per 1M tokens
		completion: 0.01, // $10.00 per 1M tokens
	},
	"gpt-4o-2024-11-20": {
		prompt: 0.0025, // $2.50 per 1M tokens
		completion: 0.01, // $10.00 per 1M tokens
	},
	"gpt-4o-2024-08-06": {
		prompt: 0.0025, // $2.50 per 1M tokens
		completion: 0.01, // $10.00 per 1M tokens
	},
	"gpt-4o-2024-05-13": {
		prompt: 0.005, // $5.00 per 1M tokens (legacy pricing)
		completion: 0.015, // $15.00 per 1M tokens (legacy pricing)
	},
	"gpt-4o-audio-preview": {
		prompt: 0.0025, // $2.50 per 1M tokens
		completion: 0.01, // $10.00 per 1M tokens
	},
	"gpt-4o-audio-preview-2024-12-17": {
		prompt: 0.0025, // $2.50 per 1M tokens
		completion: 0.01, // $10.00 per 1M tokens
	},
	"gpt-4o-realtime-preview": {
		prompt: 0.005, // $5.00 per 1M tokens
		completion: 0.02, // $20.00 per 1M tokens
	},
	"gpt-4o-realtime-preview-2024-12-17": {
		prompt: 0.005, // $5.00 per 1M tokens
		completion: 0.02, // $20.00 per 1M tokens
	},

	// GPT-4o mini series
	"gpt-4o-mini": {
		prompt: 0.00015, // $0.15 per 1M tokens
		completion: 0.0006, // $0.60 per 1M tokens
	},
	"gpt-4o-mini-2024-07-18": {
		prompt: 0.00015, // $0.15 per 1M tokens
		completion: 0.0006, // $0.60 per 1M tokens
	},
	"gpt-4o-mini-audio-preview": {
		prompt: 0.00015, // $0.15 per 1M tokens
		completion: 0.0006, // $0.60 per 1M tokens
	},
	"gpt-4o-mini-audio-preview-2024-12-17": {
		prompt: 0.00015, // $0.15 per 1M tokens
		completion: 0.0006, // $0.60 per 1M tokens
	},
	"gpt-4o-mini-realtime-preview": {
		prompt: 0.0006, // $0.60 per 1M tokens
		completion: 0.0024, // $2.40 per 1M tokens
	},
	"gpt-4o-mini-realtime-preview-2024-12-17": {
		prompt: 0.0006, // $0.60 per 1M tokens
		completion: 0.0024, // $2.40 per 1M tokens
	},

	// o1 series
	o1: {
		prompt: 0.015, // $15.00 per 1M tokens
		completion: 0.06, // $60.00 per 1M tokens
	},
	"o1-2024-12-17": {
		prompt: 0.015, // $15.00 per 1M tokens
		completion: 0.06, // $60.00 per 1M tokens
	},
	"o1-pro": {
		prompt: 0.15, // $150.00 per 1M tokens
		completion: 0.6, // $600.00 per 1M tokens
	},
	"o1-pro-2025-03-19": {
		prompt: 0.15, // $150.00 per 1M tokens
		completion: 0.6, // $600.00 per 1M tokens
	},
	"o1-mini": {
		prompt: 0.0011, // $1.10 per 1M tokens
		completion: 0.0044, // $4.40 per 1M tokens
	},
	"o1-mini-2024-09-12": {
		prompt: 0.0011, // $1.10 per 1M tokens
		completion: 0.0044, // $4.40 per 1M tokens
	},

	// o3 series
	o3: {
		prompt: 0.01, // $10.00 per 1M tokens
		completion: 0.04, // $40.00 per 1M tokens
	},
	"o3-2025-04-16": {
		prompt: 0.01, // $10.00 per 1M tokens
		completion: 0.04, // $40.00 per 1M tokens
	},
	"o3-mini": {
		prompt: 0.0011, // $1.10 per 1M tokens
		completion: 0.0044, // $4.40 per 1M tokens
	},
	"o3-mini-2025-01-31": {
		prompt: 0.0011, // $1.10 per 1M tokens
		completion: 0.0044, // $4.40 per 1M tokens
	},

	// o4 series
	"o4-mini": {
		prompt: 0.0011, // $1.10 per 1M tokens
		completion: 0.0044, // $4.40 per 1M tokens
	},
	"o4-mini-2025-04-16": {
		prompt: 0.0011, // $1.10 per 1M tokens
		completion: 0.0044, // $4.40 per 1M tokens
	},
};

const ANTHROPIC_MODELS: Record<AnthropicModel, ModelPricing> = {
	// Claude Opus models
	"claude-opus-4-20250514": {
		prompt: 0.015, // $15.00 per 1M tokens
		completion: 0.075, // $75.00 per 1M tokens
	},
	"claude-3-opus-20240229": {
		prompt: 0.015, // $15.00 per 1M tokens
		completion: 0.075, // $75.00 per 1M tokens
	},
	"claude-3-opus-latest": {
		prompt: 0.015, // $15.00 per 1M tokens
		completion: 0.075, // $75.00 per 1M tokens
	},

	// Claude Sonnet models
	"claude-sonnet-4-20250514": {
		prompt: 0.003, // $3.00 per 1M tokens
		completion: 0.015, // $15.00 per 1M tokens
	},
	"claude-3-7-sonnet-20250219": {
		prompt: 0.003, // $3.00 per 1M tokens
		completion: 0.015, // $15.00 per 1M tokens
	},
	"claude-3-7-sonnet-latest": {
		prompt: 0.003, // $3.00 per 1M tokens
		completion: 0.015, // $15.00 per 1M tokens
	},
	"claude-3-5-sonnet-20241022": {
		prompt: 0.003, // $3.00 per 1M tokens
		completion: 0.015, // $15.00 per 1M tokens
	},
	"claude-3-5-sonnet-latest": {
		prompt: 0.003, // $3.00 per 1M tokens
		completion: 0.015, // $15.00 per 1M tokens
	},
	"claude-3-5-sonnet-20240620": {
		prompt: 0.003, // $3.00 per 1M tokens
		completion: 0.015, // $15.00 per 1M tokens
	},
	"claude-3-sonnet-20240229": {
		prompt: 0.003, // $3.00 per 1M tokens (assuming same as other Sonnet 3.x)
		completion: 0.015, // $15.00 per 1M tokens
	},

	// Claude Haiku models
	"claude-3-5-haiku-20241022": {
		prompt: 0.0008, // $0.80 per 1M tokens
		completion: 0.004, // $4.00 per 1M tokens
	},
	"claude-3-5-haiku-latest": {
		prompt: 0.0008, // $0.80 per 1M tokens
		completion: 0.004, // $4.00 per 1M tokens
	},
	"claude-3-haiku-20240307": {
		prompt: 0.00025, // $0.25 per 1M tokens
		completion: 0.00125, // $1.25 per 1M tokens
	},
};

const GOOGLE_MODELS: Record<GoogleModel, ModelPricing> = {
	// Gemini 2.5 series (latest)
	"gemini-2.5-pro": {
		prompt: 1.25, // $1.25 per 1M tokens (≤200k), $2.50 (>200k)
		completion: 10.0, // $10.00 per 1M tokens (≤200k), $15.00 (>200k)
	},
	"gemini-2.5-flash": {
		prompt: 0.3, // $0.30 per 1M tokens (text/image/video), $1.00 (audio)
		completion: 2.5, // $2.50 per 1M tokens
	},

	// Gemini 2.0 series
	"gemini-2.0-flash": {
		prompt: 0.1, // $0.10 per 1M tokens (text/image/video), $0.70 (audio)
		completion: 0.4, // $0.40 per 1M tokens
	},

	// Gemini 1.5 series
	"gemini-1.5-flash": {
		prompt: 0.075, // $0.075 per 1M tokens (≤128k), $0.15 (>128k)
		completion: 0.3, // $0.30 per 1M tokens (≤128k), $0.60 (>128k)
	},
	"gemini-1.5-pro": {
		prompt: 1.25, // $1.25 per 1M tokens (≤128k), $2.50 (>128k)
		completion: 5.0, // $5.00 per 1M tokens (≤128k), $10.00 (>128k)
	},
};

const PROVIDER_MODELS = {
	OPENAI: OPENAI_MODELS,
	ANTHROPIC: ANTHROPIC_MODELS,
	GOOGLE: GOOGLE_MODELS,
} as const;

// Default pricing fallbacks for unknown models
const DEFAULT_OPENAI_PRICING: ModelPricing = {
	prompt: 0.003, // $3.00 per 1M tokens (reasonable default)
	completion: 0.006, // $6.00 per 1M tokens
};

const DEFAULT_ANTHROPIC_PRICING: ModelPricing = {
	prompt: 0.003, // $3.00 per 1M tokens
	completion: 0.015, // $15.00 per 1M tokens
};

const DEFAULT_GOOGLE_PRICING: ModelPricing = {
	prompt: 0.3, // $0.30 per 1M tokens (based on Flash models)
	completion: 1.5, // $1.50 per 1M tokens
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
