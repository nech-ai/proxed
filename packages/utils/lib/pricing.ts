import type { Provider, Model, OpenAIModel, AnthropicModel } from "./providers";

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

const PROVIDER_MODELS = {
	OPENAI: OPENAI_MODELS,
	ANTHROPIC: ANTHROPIC_MODELS,
} as const;

export function calculateCosts(params: {
	provider: Provider;
	model: Model;
	promptTokens: number;
	completionTokens: number;
}) {
	const { provider, model, promptTokens, completionTokens } = params;
	const pricing =
		provider === "OPENAI"
			? OPENAI_MODELS[model as OpenAIModel]
			: ANTHROPIC_MODELS[model as AnthropicModel];

	if (!pricing) {
		throw new Error(`Unknown model: ${model} for provider: ${provider}`);
	}

	const promptCost = (promptTokens / 1000) * pricing.prompt;
	const completionCost = (completionTokens / 1000) * pricing.completion;

	return {
		promptCost,
		completionCost,
		totalCost: promptCost + completionCost,
	};
}

export function getModelPricing(
	provider: Provider,
	model: Model,
): ModelPricing {
	return provider === "OPENAI"
		? OPENAI_MODELS[model as OpenAIModel]
		: ANTHROPIC_MODELS[model as AnthropicModel];
}
