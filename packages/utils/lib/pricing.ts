type ModelPricing = {
	prompt: number;
	completion: number;
};

type OpenAIModel =
	| "gpt-4o"
	| "gpt-4o-2024-11-20"
	| "gpt-4o-2024-08-06"
	| "gpt-4o-2024-05-13"
	| "gpt-4o-mini"
	| "gpt-4o-mini-2024-07-18";

type AnthropicModel = "claude-3-7-sonnet-latest";
type SupportedModel = OpenAIModel | AnthropicModel;

type OpenAIModels = { [K in OpenAIModel]: ModelPricing };
type AnthropicModels = { [K in AnthropicModel]: ModelPricing };

const OPENAI_MODELS: OpenAIModels = {
	"gpt-4o": {
		prompt: 0.0025,
		completion: 0.01,
	},
	"gpt-4o-2024-11-20": {
		prompt: 0.0025,
		completion: 0.01,
	},
	"gpt-4o-2024-08-06": {
		prompt: 0.0025,
		completion: 0.01,
	},
	"gpt-4o-2024-05-13": {
		prompt: 0.005,
		completion: 0.015,
	},
	"gpt-4o-mini": {
		prompt: 0.00015,
		completion: 0.0006,
	},
	"gpt-4o-mini-2024-07-18": {
		prompt: 0.00015,
		completion: 0.0006,
	},
} as const;

const ANTHROPIC_MODELS: AnthropicModels = {
	"claude-3-7-sonnet-latest": {
		prompt: 0.003,
		completion: 0.015,
	},
} as const;

const PROVIDER_MODELS = {
	OPENAI: OPENAI_MODELS,
	ANTHROPIC: ANTHROPIC_MODELS,
} as const;

type Provider = keyof typeof PROVIDER_MODELS;

export function calculateCosts(params: {
	provider: Provider;
	model: SupportedModel;
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

export function isValidModel(
	provider: Provider,
	model: string,
): model is SupportedModel {
	return model in PROVIDER_MODELS[provider];
}

export function getModelPricing(
	provider: Provider,
	model: SupportedModel,
): ModelPricing {
	return provider === "OPENAI"
		? OPENAI_MODELS[model as OpenAIModel]
		: ANTHROPIC_MODELS[model as AnthropicModel];
}
