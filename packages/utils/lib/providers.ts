/**
 * Centralized provider and model configuration
 * This file serves as the single source of truth for AI providers and their models
 */

// Provider types
export const PROVIDERS = {
	OPENAI: "OPENAI",
	ANTHROPIC: "ANTHROPIC",
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
		// GPT-4.1 series
		"gpt-4.1": { displayName: "GPT-4.1", order: 1, badge: "new" as ModelBadge },
		"gpt-4.1-2025-04-14": {
			displayName: "GPT-4.1 (2025-04-14)",
			order: 2,
			badge: "new" as ModelBadge,
		},
		"gpt-4.1-mini": {
			displayName: "GPT-4.1 Mini",
			order: 3,
			badge: "new" as ModelBadge,
		},
		"gpt-4.1-mini-2025-04-14": {
			displayName: "GPT-4.1 Mini (2025-04-14)",
			order: 4,
			badge: "new" as ModelBadge,
		},
		"gpt-4.1-nano": {
			displayName: "GPT-4.1 Nano",
			order: 5,
			badge: "new" as ModelBadge,
		},
		"gpt-4.1-nano-2025-04-14": {
			displayName: "GPT-4.1 Nano (2025-04-14)",
			order: 6,
			badge: "new" as ModelBadge,
		},

		// GPT-4.5 series
		"gpt-4.5-preview": {
			displayName: "GPT-4.5 Preview",
			order: 7,
			badge: "preview" as ModelBadge,
		},
		"gpt-4.5-preview-2025-02-27": {
			displayName: "GPT-4.5 Preview (2025-02-27)",
			order: 8,
			badge: "preview" as ModelBadge,
		},

		// GPT-4o series
		"gpt-4o": { displayName: "GPT-4o", order: 9 },
		"gpt-4o-2024-11-20": { displayName: "GPT-4o (2024-11-20)", order: 10 },
		"gpt-4o-2024-08-06": { displayName: "GPT-4o (2024-08-06)", order: 11 },
		"gpt-4o-2024-05-13": {
			displayName: "GPT-4o (2024-05-13)",
			order: 12,
			badge: "deprecated" as ModelBadge,
		},
		"gpt-4o-audio-preview": {
			displayName: "GPT-4o Audio Preview",
			order: 13,
			badge: "preview" as ModelBadge,
		},
		"gpt-4o-audio-preview-2024-12-17": {
			displayName: "GPT-4o Audio Preview (2024-12-17)",
			order: 14,
			badge: "preview" as ModelBadge,
		},
		"gpt-4o-realtime-preview": {
			displayName: "GPT-4o Realtime Preview",
			order: 15,
			badge: "preview" as ModelBadge,
		},
		"gpt-4o-realtime-preview-2024-12-17": {
			displayName: "GPT-4o Realtime Preview (2024-12-17)",
			order: 16,
			badge: "preview" as ModelBadge,
		},

		// GPT-4o mini series
		"gpt-4o-mini": { displayName: "GPT-4o Mini", order: 17 },
		"gpt-4o-mini-2024-07-18": {
			displayName: "GPT-4o Mini (2024-07-18)",
			order: 18,
		},
		"gpt-4o-mini-audio-preview": {
			displayName: "GPT-4o Mini Audio Preview",
			order: 19,
			badge: "preview" as ModelBadge,
		},
		"gpt-4o-mini-audio-preview-2024-12-17": {
			displayName: "GPT-4o Mini Audio Preview (2024-12-17)",
			order: 20,
			badge: "preview" as ModelBadge,
		},
		"gpt-4o-mini-realtime-preview": {
			displayName: "GPT-4o Mini Realtime Preview",
			order: 21,
			badge: "preview" as ModelBadge,
		},
		"gpt-4o-mini-realtime-preview-2024-12-17": {
			displayName: "GPT-4o Mini Realtime Preview (2024-12-17)",
			order: 22,
			badge: "preview" as ModelBadge,
		},

		// o1 series
		o1: { displayName: "o1", order: 23 },
		"o1-2024-12-17": { displayName: "o1 (2024-12-17)", order: 24 },
		"o1-pro": { displayName: "o1 Pro", order: 25, badge: "new" as ModelBadge },
		"o1-pro-2025-03-19": {
			displayName: "o1 Pro (2025-03-19)",
			order: 26,
			badge: "new" as ModelBadge,
		},
		"o1-mini": { displayName: "o1 Mini", order: 27 },
		"o1-mini-2024-09-12": { displayName: "o1 Mini (2024-09-12)", order: 28 },

		// o3 series
		o3: { displayName: "o3", order: 29, badge: "new" as ModelBadge },
		"o3-2025-04-16": {
			displayName: "o3 (2025-04-16)",
			order: 30,
			badge: "new" as ModelBadge,
		},
		"o3-mini": {
			displayName: "o3 Mini",
			order: 31,
			badge: "new" as ModelBadge,
		},
		"o3-mini-2025-01-31": {
			displayName: "o3 Mini (2025-01-31)",
			order: 32,
			badge: "new" as ModelBadge,
		},

		// o4 series
		"o4-mini": {
			displayName: "o4 Mini",
			order: 33,
			badge: "new" as ModelBadge,
		},
		"o4-mini-2025-04-16": {
			displayName: "o4 Mini (2025-04-16)",
			order: 34,
			badge: "new" as ModelBadge,
		},
	},
	ANTHROPIC: {
		// Claude Opus models
		"claude-opus-4-20250514": {
			displayName: "Claude Opus 4",
			order: 1,
			badge: "new" as ModelBadge,
		},
		"claude-3-opus-20240229": { displayName: "Claude 3 Opus", order: 2 },
		"claude-3-opus-latest": { displayName: "Claude 3 Opus (Latest)", order: 3 },

		// Claude Sonnet models
		"claude-sonnet-4-20250514": {
			displayName: "Claude Sonnet 4",
			order: 4,
			badge: "new" as ModelBadge,
		},
		"claude-3-7-sonnet-20250219": {
			displayName: "Claude 3.7 Sonnet",
			order: 5,
			badge: "new" as ModelBadge,
		},
		"claude-3-7-sonnet-latest": {
			displayName: "Claude 3.7 Sonnet (Latest)",
			order: 6,
			badge: "new" as ModelBadge,
		},
		"claude-3-5-sonnet-20241022": {
			displayName: "Claude 3.5 Sonnet v2",
			order: 7,
		},
		"claude-3-5-sonnet-latest": {
			displayName: "Claude 3.5 Sonnet (Latest)",
			order: 8,
		},
		"claude-3-5-sonnet-20240620": {
			displayName: "Claude 3.5 Sonnet",
			order: 9,
		},
		"claude-3-sonnet-20240229": { displayName: "Claude 3 Sonnet", order: 10 },

		// Claude Haiku models
		"claude-3-5-haiku-20241022": { displayName: "Claude 3.5 Haiku", order: 11 },
		"claude-3-5-haiku-latest": {
			displayName: "Claude 3.5 Haiku (Latest)",
			order: 12,
		},
		"claude-3-haiku-20240307": { displayName: "Claude 3 Haiku", order: 13 },
	},
} as const;

// Type definitions for models
export type OpenAIModel = keyof typeof MODELS.OPENAI;
export type AnthropicModel = keyof typeof MODELS.ANTHROPIC;
export type Model = OpenAIModel | AnthropicModel;

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
