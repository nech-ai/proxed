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
			return "gemini-1.5-pro";
		default:
			// Fallback to a commonly supported model
			return "gpt-4o";
	}
}

/**
 * Check if a model supports structured outputs
 * Note: This is a simplified check. In practice, you might want to
 * maintain a more comprehensive list or check with the provider's API
 */
export function supportsStructuredOutputs(
	provider: ProviderType,
	model: string,
): boolean {
	switch (provider) {
		case "OPENAI":
			// GPT-4o models support structured outputs
			return model.includes("gpt-4o") || model.includes("gpt-4.1");
		case "ANTHROPIC":
			// Claude 3 models support structured outputs
			return (
				model.includes("claude-3") ||
				model.includes("claude-opus-4") ||
				model.includes("claude-sonnet-4")
			);
		case "GOOGLE":
			// Gemini 1.5 and 2.x models support structured outputs
			return (
				model.includes("gemini-1.5") ||
				model.includes("gemini-2") ||
				model === "gemini-pro"
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
			return "gemini-1.5-pro";
		default:
			return "gpt-4o";
	}
}

/**
 * Check if a model supports vision/image inputs
 */
export function supportsVision(provider: ProviderType, model: string): boolean {
	switch (provider) {
		case "OPENAI":
			// GPT-4 vision models
			return (
				model.includes("gpt-4o") ||
				model.includes("gpt-4.1") ||
				model.includes("vision")
			);
		case "ANTHROPIC":
			// All Claude 3 models support vision
			return (
				model.includes("claude-3") ||
				model.includes("claude-opus-4") ||
				model.includes("claude-sonnet-4")
			);
		case "GOOGLE":
			// Most Gemini models support vision, except embedding models
			return (
				!model.includes("embedding") &&
				!model.includes("text-embedding") &&
				(model.includes("gemini") || model.includes("vision"))
			);
		default:
			return false;
	}
}

/**
 * Check if a model supports PDF/document inputs
 */
export function supportsPDF(provider: ProviderType, model: string): boolean {
	switch (provider) {
		case "OPENAI":
			// GPT-4o models support file inputs
			return model.includes("gpt-4o") || model.includes("gpt-4.1");
		case "ANTHROPIC":
			// Claude 3 models support document inputs
			return (
				model.includes("claude-3") ||
				model.includes("claude-opus-4") ||
				model.includes("claude-sonnet-4")
			);
		case "GOOGLE":
			// Gemini 1.5 and newer support document inputs
			return (
				model.includes("gemini-1.5") ||
				model.includes("gemini-2") ||
				model === "gemini-pro"
			);
		default:
			return false;
	}
}
