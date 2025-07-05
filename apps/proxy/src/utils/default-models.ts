import type { ProviderType } from "../rest/types";

/**
 * Get the default model for a given provider
 * These models are known to support structured outputs
 */
export function getDefaultModel(provider: ProviderType): string {
	switch (provider) {
		case "OPENAI":
			return "gpt-4o";
		case "ANTHROPIC":
			return "claude-3-5-sonnet-latest";
		case "GOOGLE":
			return "gemini-2.5-pro";
		default:
			// Fallback to a commonly supported model
			return "gpt-4o";
	}
}

/**
 * Check if a model supports structured outputs
 * Based on AI SDK documentation for Object Generation capability
 */
export function supportsStructuredOutputs(
	provider: ProviderType,
	model: string,
): boolean {
	switch (provider) {
		case "OPENAI":
			// Modern OpenAI models with structured output support
			return (
				// GPT-4.1 series
				model.startsWith("gpt-4.1") ||
				// GPT-4o series
				model.startsWith("gpt-4o") ||
				// GPT-4 Turbo
				model === "gpt-4-turbo" ||
				model === "gpt-4" ||
				// o1 reasoning models
				model === "o1" ||
				model === "o1-mini" ||
				model === "o1-preview" ||
				// o3 series
				model.startsWith("o3") ||
				// o4 series
				model.startsWith("o4")
			);
		case "ANTHROPIC":
			// All modern Claude models support structured outputs
			return (
				model.includes("claude-3") ||
				model.includes("claude-opus-4") ||
				model.includes("claude-sonnet-4") ||
				model.includes("claude-4")
			);
		case "GOOGLE":
			// Modern Gemini models with structured outputs
			// Exclude embedding models
			if (model.includes("embedding") || model.includes("text-embedding")) {
				return false;
			}
			return (
				model.includes("gemini-1.5") ||
				model.includes("gemini-2") ||
				model === "gemini-pro" ||
				model === "gemini-pro-vision"
			);
		default:
			return false;
	}
}

/**
 * Get the appropriate model for vision tasks
 */
export function getVisionModel(
	provider: ProviderType,
	preferredModel?: string,
): string {
	// If a preferred model is specified and supports vision, use it
	if (preferredModel && supportsVision(provider, preferredModel)) {
		return preferredModel;
	}

	// Otherwise, return a default vision-capable model
	switch (provider) {
		case "OPENAI":
			return "gpt-4o";
		case "ANTHROPIC":
			return "claude-3-5-sonnet-latest";
		case "GOOGLE":
			return "gemini-2.5-pro";
		default:
			return "gpt-4o";
	}
}

/**
 * Check if a model supports vision/image inputs
 * Based on AI SDK documentation for Image Input capability
 */
export function supportsVision(provider: ProviderType, model: string): boolean {
	switch (provider) {
		case "OPENAI":
			// Modern OpenAI models with vision support
			return (
				// GPT-4.1 series
				model.startsWith("gpt-4.1") ||
				// GPT-4o series (all variants)
				model.startsWith("gpt-4o") ||
				// GPT-4 Turbo and GPT-4
				model === "gpt-4-turbo" ||
				model === "gpt-4" ||
				// Explicit vision models
				model.includes("vision")
			);
		case "ANTHROPIC":
			// All modern Claude models support vision
			return (
				model.includes("claude-3") ||
				model.includes("claude-opus-4") ||
				model.includes("claude-sonnet-4") ||
				model.includes("claude-4")
			);
		case "GOOGLE":
			// Modern Gemini models support vision, except embedding models
			if (model.includes("embedding") || model.includes("text-embedding")) {
				return false;
			}
			return (
				model.includes("gemini-1.5") ||
				model.includes("gemini-2") ||
				model === "gemini-pro" ||
				model === "gemini-pro-vision"
			);
		default:
			return false;
	}
}

/**
 * Check if a model supports PDF/document inputs
 * Based on AI SDK documentation and multimodal capabilities
 */
export function supportsPDF(provider: ProviderType, model: string): boolean {
	switch (provider) {
		case "OPENAI":
			// Modern OpenAI models with file/document support
			return (
				// GPT-4.1 series
				model.startsWith("gpt-4.1") ||
				// GPT-4o series
				model.startsWith("gpt-4o") ||
				// GPT-4 Turbo
				model === "gpt-4-turbo"
			);
		case "ANTHROPIC":
			// All modern Claude models support document inputs
			return (
				model.includes("claude-3") ||
				model.includes("claude-opus-4") ||
				model.includes("claude-sonnet-4") ||
				model.includes("claude-4")
			);
		case "GOOGLE":
			// Modern Gemini models support document inputs
			// Exclude embedding models
			if (model.includes("embedding") || model.includes("text-embedding")) {
				return false;
			}
			return (
				model.includes("gemini-1.5") ||
				model.includes("gemini-2") ||
				model === "gemini-pro" ||
				model === "gemini-pro-vision"
			);
		default:
			return false;
	}
}
