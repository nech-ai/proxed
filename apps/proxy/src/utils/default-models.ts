import type { ProviderType } from "../rest/types";

/**
 * Get the default model for a given provider
 * These models are known to support structured outputs
 */
export function getDefaultModel(provider: ProviderType): string {
	switch (provider) {
		case "OPENAI":
			return "gpt-4.1-mini";
		case "ANTHROPIC":
			return "claude-4-sonnet-20250514";
		case "GOOGLE":
			return "gemini-2.5-flash";
		default:
			// Fallback to a commonly supported model
			return "gpt-4.1-mini";
	}
}

/**
 * Check if a model supports structured outputs
 * Based on AI SDK documentation for Object Generation capability
 * All models in AI SDK 5 support structured outputs
 */
export function supportsStructuredOutputs(
	provider: ProviderType,
	model: string,
): boolean {
	switch (provider) {
		case "OPENAI":
			// All AI SDK 5 OpenAI models support structured outputs
			return (
				// GPT-4.1 series
				model === "gpt-4.1" ||
				model === "gpt-4.1-mini" ||
				model === "gpt-4.1-nano" ||
				// GPT-4o series
				model === "gpt-4o" ||
				model === "gpt-4o-mini" ||
				model === "gpt-4o-audio-preview" ||
				// GPT-4 series
				model === "gpt-4-turbo" ||
				model === "gpt-4" ||
				model === "gpt-3.5-turbo" ||
				// o1 reasoning models
				model === "o1" ||
				model === "o1-mini" ||
				model === "o1-preview" ||
				// o3 series
				model === "o3" ||
				model === "o3-mini" ||
				// o4 series
				model === "o4-mini" ||
				// ChatGPT models
				model === "chatgpt-4o-latest"
			);
		case "ANTHROPIC":
			// All AI SDK 5 Anthropic models support structured outputs
			return (
				// Claude 4 models
				model === "claude-4-opus-20250514" ||
				model === "claude-4-sonnet-20250514" ||
				// Claude 3.7
				model === "claude-3-7-sonnet-20250219" ||
				// Claude 3.5 models
				model === "claude-3-5-sonnet-20241022" ||
				model === "claude-3-5-sonnet-20240620" ||
				model === "claude-3-5-haiku-20241022" ||
				// Claude 3 models
				model === "claude-3-opus-20240229" ||
				model === "claude-3-sonnet-20240229" ||
				model === "claude-3-haiku-20240307"
			);
		case "GOOGLE":
			// All AI SDK 5 Google models support structured outputs
			return (
				// Gemini 2.5 series
				model === "gemini-2.5-pro" ||
				model === "gemini-2.5-flash" ||
				model === "gemini-2.5-flash-lite" ||
				model === "gemini-2.5-flash-lite-preview-06-17" ||
				// Gemini 2.0 series
				model === "gemini-2.0-flash" ||
				model === "gemini-2.0-flash-exp" ||
				// Gemini 1.5 series
				model === "gemini-1.5-pro" ||
				model === "gemini-1.5-pro-latest" ||
				model === "gemini-1.5-flash" ||
				model === "gemini-1.5-flash-latest" ||
				model === "gemini-1.5-flash-8b" ||
				model === "gemini-1.5-flash-8b-latest"
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
			return "claude-4-sonnet-20250514";
		case "GOOGLE":
			return "gemini-2.5-flash";
		default:
			return "gpt-4o";
	}
}

/**
 * Check if a model supports vision/image inputs
 * Based on AI SDK documentation for Image Input capability
 * All models in AI SDK 5 support vision
 */
export function supportsVision(provider: ProviderType, model: string): boolean {
	// All AI SDK 5 models support vision/image inputs
	// This is the same as structured outputs support
	return supportsStructuredOutputs(provider, model);
}

/**
 * Check if a model supports PDF/document inputs
 * Based on AI SDK documentation and multimodal capabilities
 * All models in AI SDK 5 support PDF/document inputs
 */
export function supportsPDF(provider: ProviderType, model: string): boolean {
	// All AI SDK 5 models support PDF/document inputs
	// This is the same as structured outputs support
	return supportsStructuredOutputs(provider, model);
}
