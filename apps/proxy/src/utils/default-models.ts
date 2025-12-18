import type { ProviderType } from "../rest/types";
import { isModelForProvider } from "@proxed/utils/lib/providers";

/**
 * Get the default model for a given provider
 * These models are known to support structured outputs
 */
export function getDefaultModel(provider: ProviderType): string {
	switch (provider) {
		case "OPENAI":
			return "gpt-4.1-mini";
		case "ANTHROPIC":
			return "claude-sonnet-4-0";
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
	// Structured outputs are supported for the provider's known text models.
	// Explicitly exclude image-generation models.
	return isModelForProvider(model, provider) && !supportsImageGeneration(provider, model);
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
			return "claude-sonnet-4-0";
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

/**
 * Get the default image generation model for a given provider
 */
export function getDefaultImageModel(provider: ProviderType): string {
	switch (provider) {
		case "OPENAI":
			return "gpt-image-1"; // or "dall-e-3"
		case "GOOGLE":
			return "imagen-4.0-generate-001";
		default:
			// If provider doesn't support image generation natively, fallback to OpenAI default
			return "gpt-image-1";
	}
}

/**
 * Check if the provider/model supports image generation
 */
export function supportsImageGeneration(
	provider: ProviderType,
	model: string,
): boolean {
	switch (provider) {
		case "OPENAI":
			return (
				model === "gpt-image-1" ||
				model === "gpt-image-1.5" ||
				model === "gpt-image-1-mini" ||
				model === "chatgpt-image-latest" ||
				model === "dall-e-3" ||
				model === "dall-e-2"
			);
		case "GOOGLE":
			return (
				model === "imagen-4.0-generate-001" ||
				model === "imagen-4.0-fast-generate-001" ||
				model === "imagen-4.0-ultra-generate-001"
			);
		default:
			return false;
	}
}
