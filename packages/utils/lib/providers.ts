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
		// GPT-5.2
		"gpt-5.2-pro": {
			displayName: "GPT-5.2 Pro",
			order: 3,
			badge: "new" as ModelBadge,
		},
		"gpt-5.2-chat-latest": {
			displayName: "GPT-5.2 Chat (latest)",
			order: 1,
			badge: "new" as ModelBadge,
		},
		"gpt-5.2": { displayName: "GPT-5.2", order: 2, badge: "new" as ModelBadge },

		// GPT-5.1
		"gpt-5.1-chat-latest": {
			displayName: "GPT-5.1 Chat (latest)",
			order: 5,
		},
		"gpt-5.1": { displayName: "GPT-5.1", order: 6 },

		// GPT-5
		"gpt-5-chat-latest": {
			displayName: "GPT-5 Chat (latest)",
			order: 7,
		},
		"gpt-5": { displayName: "GPT-5", order: 8 },
		"gpt-5-pro": {
			displayName: "GPT-5 Pro",
			order: 9,
			badge: "new" as ModelBadge,
		},
		"gpt-5-mini": { displayName: "GPT-5 Mini", order: 10 },
		"gpt-5-nano": { displayName: "GPT-5 Nano", order: 11 },

		// Codex
		"gpt-5.1-codex-max": {
			displayName: "GPT-5.1 Codex Max",
			order: 20,
			badge: "new" as ModelBadge,
		},
		"gpt-5.1-codex": {
			displayName: "GPT-5.1 Codex",
			order: 21,
			badge: "new" as ModelBadge,
		},
		"gpt-5.1-codex-mini": {
			displayName: "GPT-5.1 Codex Mini",
			order: 22,
			badge: "new" as ModelBadge,
		},
		"gpt-5-codex": {
			displayName: "GPT-5 Codex",
			order: 23,
			badge: "new" as ModelBadge,
		},
		"codex-mini-latest": {
			displayName: "Codex Mini (latest)",
			order: 24,
			badge: "preview" as ModelBadge,
		},

		// GPT-4.1 series
		"gpt-4.1": { displayName: "GPT-4.1", order: 20 },
		"gpt-4.1-mini": {
			displayName: "GPT-4.1 Mini",
			order: 21,
		},
		"gpt-4.1-nano": {
			displayName: "GPT-4.1 Nano",
			order: 22,
		},

		// GPT-4o series - Supported in AI SDK 5
		"gpt-4o": { displayName: "GPT-4o", order: 30 },
		"gpt-4o-mini": { displayName: "GPT-4o Mini", order: 31 },

		// GPT-4 series - Supported in AI SDK 5
		"gpt-4-turbo": {
			displayName: "GPT-4 Turbo",
			order: 40,
			badge: "deprecated" as ModelBadge,
		},
		"gpt-4": {
			displayName: "GPT-4",
			order: 41,
			badge: "deprecated" as ModelBadge,
		},
		"gpt-3.5-turbo": {
			displayName: "GPT-3.5 Turbo",
			order: 42,
			badge: "deprecated" as ModelBadge,
		},

		// o1 series - Supported in AI SDK 5
		"o1-pro": { displayName: "o1 Pro", order: 50, badge: "new" as ModelBadge },
		o1: { displayName: "o1", order: 51 },
		"o1-mini": { displayName: "o1 Mini", order: 52 },
		"o1-preview": {
			displayName: "o1 Preview",
			order: 53,
			badge: "deprecated" as ModelBadge,
		},

		// o3 series - Supported in AI SDK 5
		"o3-pro": { displayName: "o3 Pro", order: 60, badge: "new" as ModelBadge },
		o3: { displayName: "o3", order: 61 },
		"o3-mini": {
			displayName: "o3 Mini",
			order: 62,
		},
		"o3-deep-research": {
			displayName: "o3 Deep Research",
			order: 63,
			badge: "new" as ModelBadge,
		},

		// o4 series - Supported in AI SDK 5
		"o4-mini": {
			displayName: "o4 Mini",
			order: 70,
		},
		"o4-mini-deep-research": {
			displayName: "o4 Mini Deep Research",
			order: 71,
			badge: "new" as ModelBadge,
		},

		// ChatGPT models - Supported in AI SDK 5
		"chatgpt-4o-latest": {
			displayName: "ChatGPT 4o (latest)",
			order: 80,
			badge: "preview" as ModelBadge,
		},

		// Image generation models
		"gpt-image-1": {
			displayName: "GPT Image 1",
			order: 90,
			badge: "experimental" as ModelBadge,
		},
		"gpt-image-1.5": {
			displayName: "GPT Image 1.5",
			order: 91,
			badge: "experimental" as ModelBadge,
		},
		"gpt-image-1-mini": {
			displayName: "GPT Image 1 Mini",
			order: 92,
			badge: "experimental" as ModelBadge,
		},
		"chatgpt-image-latest": {
			displayName: "ChatGPT Image (latest)",
			order: 93,
			badge: "preview" as ModelBadge,
		},
		"dall-e-3": {
			displayName: "DALL·E 3",
			order: 94,
			badge: "deprecated" as ModelBadge,
		},
		"dall-e-2": {
			displayName: "DALL·E 2",
			order: 95,
			badge: "deprecated" as ModelBadge,
		},
	},
	ANTHROPIC: {
		// Claude 4.5 (newest)
		"claude-opus-4-5": {
			displayName: "Claude Opus 4.5",
			order: 1,
			badge: "new" as ModelBadge,
		},
		"claude-sonnet-4-5": {
			displayName: "Claude Sonnet 4.5",
			order: 2,
			badge: "new" as ModelBadge,
		},
		"claude-haiku-4-5": {
			displayName: "Claude Haiku 4.5",
			order: 3,
			badge: "new" as ModelBadge,
		},

		// Claude 4.x
		"claude-opus-4-1": { displayName: "Claude Opus 4.1", order: 4 },
		"claude-opus-4-0": { displayName: "Claude Opus 4", order: 5 },
		"claude-sonnet-4-0": { displayName: "Claude Sonnet 4", order: 6 },
		"claude-opus-4-20250514": {
			displayName: "Claude Opus 4 (20250514)",
			order: 7,
		},
		"claude-sonnet-4-20250514": {
			displayName: "Claude Sonnet 4 (20250514)",
			order: 8,
		},

		// Claude 3.7 Sonnet - Supported in AI SDK 5
		"claude-3-7-sonnet-20250219": {
			displayName: "Claude 3.7 Sonnet",
			order: 20,
		},

		// Claude 3.5 models - Supported in AI SDK 5
		"claude-3-5-sonnet-20241022": {
			displayName: "Claude 3.5 Sonnet v2",
			order: 30,
		},
		"claude-3-5-sonnet-20240620": {
			displayName: "Claude 3.5 Sonnet",
			order: 31,
		},
		"claude-3-5-haiku-20241022": {
			displayName: "Claude 3.5 Haiku",
			order: 32,
		},

		// Claude 3 models - Supported in AI SDK 5
		"claude-3-opus-20240229": { displayName: "Claude 3 Opus", order: 40 },
		"claude-3-sonnet-20240229": { displayName: "Claude 3 Sonnet", order: 41 },
		"claude-3-haiku-20240307": { displayName: "Claude 3 Haiku", order: 42 },
	},
	GOOGLE: {
		// Gemini 3 (preview)
		"gemini-3-pro-preview": {
			displayName: "Gemini 3 Pro (preview)",
			order: 1,
			badge: "preview" as ModelBadge,
		},
		"gemini-3-flash-preview": {
			displayName: "Gemini 3 Flash (preview)",
			order: 2,
			badge: "preview" as ModelBadge,
		},
		"gemini-3-pro-image-preview": {
			displayName: "Gemini 3 Pro Image (preview)",
			order: 3,
			badge: "preview" as ModelBadge,
		},

		// Gemini 2.5 series - Supported in AI SDK 5
		"gemini-2.5-pro": {
			displayName: "Gemini 2.5 Pro",
			order: 10,
		},
		"gemini-2.5-flash": {
			displayName: "Gemini 2.5 Flash",
			order: 11,
		},
		"gemini-2.5-flash-lite": {
			displayName: "Gemini 2.5 Flash Lite",
			order: 12,
		},

		// Gemini 2.0 series - Supported in AI SDK 5
		"gemini-2.0-flash": {
			displayName: "Gemini 2.0 Flash",
			order: 20,
		},
		"gemini-2.0-flash-lite": {
			displayName: "Gemini 2.0 Flash Lite",
			order: 21,
		},
		"gemini-2.0-flash-exp": {
			displayName: "Gemini 2.0 Flash Exp",
			order: 22,
			badge: "experimental" as ModelBadge,
		},

		// Gemini 1.5 series - Supported in AI SDK 5
		"gemini-1.5-pro": { displayName: "Gemini 1.5 Pro", order: 30 },
		"gemini-1.5-flash": { displayName: "Gemini 1.5 Flash", order: 32 },
		"gemini-1.5-flash-8b": {
			displayName: "Gemini 1.5 Flash 8B",
			order: 34,
		},

		// Image generation model(s)
		"imagen-4.0-generate-001": {
			displayName: "Imagen 4",
			order: 90,
			badge: "experimental" as ModelBadge,
		},
		"imagen-4.0-fast-generate-001": {
			displayName: "Imagen 4 Fast",
			order: 91,
			badge: "experimental" as ModelBadge,
		},
		"imagen-4.0-ultra-generate-001": {
			displayName: "Imagen 4 Ultra",
			order: 92,
			badge: "experimental" as ModelBadge,
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

export type ProviderModelOption = {
	value: string;
	label: string;
	order: number;
	badge?: ModelBadge;
};

export type AllModelOption = ProviderModelOption & {
	provider: Provider;
};

// Get models for select/dropdown components
export function getModelOptions(provider: Provider): ProviderModelOption[];
export function getModelOptions(): AllModelOption[];
export function getModelOptions(
	provider?: Provider,
): ProviderModelOption[] | AllModelOption[] {
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
