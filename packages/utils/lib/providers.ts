/**
 * Centralized provider and model configuration
 * This file serves as the single source of truth for AI providers and their models
 */

// Provider types
export const PROVIDERS = {
	OPENAI: "OPENAI",
	ANTHROPIC: "ANTHROPIC",
	GOOGLE: "GOOGLE",
} as const;

export type Provider = keyof typeof PROVIDERS;
export type ProviderValue = (typeof PROVIDERS)[Provider];

// Badge types for models
export type ModelBadge =
	| "new"
	| "deprecated"
	| "preview"
	| "beta"
	| "experimental";

// Model definition interface
interface ModelDefinition {
	displayName: string;
	order: number;
	badge?: ModelBadge;
}

// Model definitions with display names
export const MODELS = {
	OPENAI: {
		// GPT-4.1 series - Supported in AI SDK 5
		"gpt-4.1": { displayName: "GPT-4.1", order: 1, badge: "new" as ModelBadge },
		"gpt-4.1-mini": {
			displayName: "GPT-4.1 Mini",
			order: 2,
			badge: "new" as ModelBadge,
		},
		"gpt-4.1-nano": {
			displayName: "GPT-4.1 Nano",
			order: 3,
			badge: "new" as ModelBadge,
		},

		// GPT-4o series - Supported in AI SDK 5
		"gpt-4o": { displayName: "GPT-4o", order: 4 },
		"gpt-4o-mini": { displayName: "GPT-4o Mini", order: 5 },
		"gpt-4o-audio-preview": {
			displayName: "GPT-4o Audio",
			order: 6,
			badge: "preview" as ModelBadge,
		},

		// GPT-4 series - Supported in AI SDK 5
		"gpt-4-turbo": { displayName: "GPT-4 Turbo", order: 7 },
		"gpt-4": { displayName: "GPT-4", order: 8 },
		"gpt-3.5-turbo": { displayName: "GPT-3.5 Turbo", order: 9 },

		// o1 series - Supported in AI SDK 5
		o1: { displayName: "o1", order: 10 },
		"o1-mini": { displayName: "o1 Mini", order: 11 },
		"o1-preview": {
			displayName: "o1 Preview",
			order: 12,
			badge: "preview" as ModelBadge,
		},

		// o3 series - Supported in AI SDK 5
		o3: { displayName: "o3", order: 13, badge: "new" as ModelBadge },
		"o3-mini": {
			displayName: "o3 Mini",
			order: 14,
			badge: "new" as ModelBadge,
		},

		// o4 series - Supported in AI SDK 5
		"o4-mini": {
			displayName: "o4 Mini",
			order: 15,
			badge: "new" as ModelBadge,
		},

		// ChatGPT models - Supported in AI SDK 5
		"chatgpt-4o-latest": {
			displayName: "ChatGPT 4o Latest",
			order: 16,
			badge: "preview" as ModelBadge,
		},

		// GPT-5 series - Supported in AI SDK 5
		"gpt-5": { displayName: "GPT-5", order: 17, badge: "new" as ModelBadge },
		"gpt-5-mini": {
			displayName: "GPT-5 Mini",
			order: 18,
			badge: "new" as ModelBadge,
		},
		"gpt-5-nano": {
			displayName: "GPT-5 Nano",
			order: 19,
			badge: "new" as ModelBadge,
		},
		"gpt-5-chat-latest": {
			displayName: "GPT-5 Chat Latest",
			order: 20,
			badge: "new" as ModelBadge,
		},
	},
	ANTHROPIC: {
		// Claude 4 models - Supported in AI SDK 5
		"claude-4-opus-20250514": {
			displayName: "Claude 4 Opus",
			order: 1,
			badge: "new" as ModelBadge,
		},
		"claude-4-sonnet-20250514": {
			displayName: "Claude 4 Sonnet",
			order: 2,
			badge: "new" as ModelBadge,
		},

		// Claude 3.7 Sonnet - Supported in AI SDK 5
		"claude-3-7-sonnet-20250219": {
			displayName: "Claude 3.7 Sonnet",
			order: 3,
			badge: "new" as ModelBadge,
		},

		// Claude 3.5 models - Supported in AI SDK 5
		"claude-3-5-sonnet-20241022": {
			displayName: "Claude 3.5 Sonnet v2",
			order: 4,
		},
		"claude-3-5-sonnet-20240620": {
			displayName: "Claude 3.5 Sonnet",
			order: 5,
		},
		"claude-3-5-haiku-20241022": { displayName: "Claude 3.5 Haiku", order: 6 },

		// Claude 3 models - Supported in AI SDK 5
		"claude-3-opus-20240229": { displayName: "Claude 3 Opus", order: 7 },
		"claude-3-sonnet-20240229": { displayName: "Claude 3 Sonnet", order: 8 },
		"claude-3-haiku-20240307": { displayName: "Claude 3 Haiku", order: 9 },
	},
	GOOGLE: {
		// Gemini 2.5 series - Supported in AI SDK 5
		"gemini-2.5-pro": {
			displayName: "Gemini 2.5 Pro",
			order: 1,
			badge: "new" as ModelBadge,
		},
		"gemini-2.5-flash": {
			displayName: "Gemini 2.5 Flash",
			order: 2,
			badge: "new" as ModelBadge,
		},
		"gemini-2.5-flash-lite": {
			displayName: "Gemini 2.5 Flash Lite",
			order: 3,
			badge: "new" as ModelBadge,
		},
		"gemini-2.5-flash-lite-preview-06-17": {
			displayName: "Gemini 2.5 Flash Lite Preview",
			order: 4,
			badge: "preview" as ModelBadge,
		},

		// Gemini 2.0 series - Supported in AI SDK 5
		"gemini-2.0-flash": {
			displayName: "Gemini 2.0 Flash",
			order: 5,
		},
		"gemini-2.0-flash-exp": {
			displayName: "Gemini 2.0 Flash Exp",
			order: 6,
			badge: "experimental" as ModelBadge,
		},

		// Gemini 1.5 series - Supported in AI SDK 5
		"gemini-1.5-pro": { displayName: "Gemini 1.5 Pro", order: 7 },
		"gemini-1.5-pro-latest": { displayName: "Gemini 1.5 Pro Latest", order: 8 },
		"gemini-1.5-flash": { displayName: "Gemini 1.5 Flash", order: 9 },
		"gemini-1.5-flash-latest": {
			displayName: "Gemini 1.5 Flash Latest",
			order: 10,
		},
		"gemini-1.5-flash-8b": { displayName: "Gemini 1.5 Flash 8B", order: 11 },
		"gemini-1.5-flash-8b-latest": {
			displayName: "Gemini 1.5 Flash 8B Latest",
			order: 12,
		},
	},
} as const;

// Type definitions for models
export type OpenAIModel = keyof typeof MODELS.OPENAI;
export type AnthropicModel = keyof typeof MODELS.ANTHROPIC;
export type GoogleModel = keyof typeof MODELS.GOOGLE;
export type Model = OpenAIModel | AnthropicModel | GoogleModel;

// Get all models as a flat array
export const ALL_MODELS = Object.entries(MODELS).flatMap(([provider, models]) =>
	Object.entries(models).map(([model, config]) => ({
		provider: provider as Provider,
		model: model as Model,
		displayName: config.displayName,
		order: config.order,
		badge: config.badge,
	})),
);

// Get models for a specific provider
export function getModelsForProvider(provider: Provider): Model[] {
	return Object.keys(MODELS[provider]) as Model[];
}

// Get model display name
export function getModelDisplayName(model: Model): string {
	for (const provider of Object.keys(MODELS) as Provider[]) {
		const models = MODELS[provider] as Record<string, ModelDefinition>;
		if (model in models) {
			return models[model].displayName;
		}
	}
	return model; // Fallback to model ID
}

// Get model badge
export function getModelBadge(model: Model): ModelBadge | undefined {
	for (const provider of Object.keys(MODELS) as Provider[]) {
		const models = MODELS[provider] as Record<string, ModelDefinition>;
		if (model in models) {
			return models[model].badge;
		}
	}
	return undefined;
}

// Check if a model belongs to a provider
export function isModelForProvider(model: string, provider: Provider): boolean {
	return model in MODELS[provider];
}

// Get provider for a model
export function getProviderForModel(model: Model): Provider | null {
	for (const provider of Object.keys(MODELS) as Provider[]) {
		if (model in MODELS[provider]) {
			return provider;
		}
	}
	return null;
}

// Validate if a string is a valid model
export function isValidModel(model: string): model is Model {
	return ALL_MODELS.some((m) => m.model === model);
}

// Get models for select/dropdown components
export function getModelOptions(provider?: Provider) {
	if (provider) {
		return Object.entries(MODELS[provider])
			.map(([value, config]) => ({
				value,
				label: config.displayName,
				order: config.order,
				badge: config.badge,
			}))
			.sort((a, b) => a.order - b.order);
	}

	return ALL_MODELS.map((m) => ({
		value: m.model,
		label: `${m.displayName} (${m.provider})`,
		provider: m.provider,
		order: m.order,
		badge: m.badge,
	})).sort((a, b) => {
		// Sort by provider first, then by order
		if (a.provider !== b.provider) {
			return a.provider.localeCompare(b.provider);
		}
		return a.order - b.order;
	});
}

// Export arrays for backwards compatibility and validation schemas
export const PROVIDER_VALUES = Object.values(PROVIDERS) as ProviderValue[];
export const MODEL_VALUES = ALL_MODELS.map((m) => m.model);

// Finish reason types (also centralized)
export const FINISH_REASONS = [
	"stop",
	"length",
	"content-filter",
	"tool-calls",
	"error",
	"other",
	"unknown",
] as const;

export type FinishReason = (typeof FINISH_REASONS)[number];
