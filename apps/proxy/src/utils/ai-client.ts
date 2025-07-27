import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { ProviderType } from "../rest/types";
import { createError, ErrorCode } from "./errors";

/**
 * Creates an AI SDK client instance based on the specified provider.
 * Compatible with AI SDK v5.
 * @param provider - The AI provider ('OPENAI', 'ANTHROPIC', or 'GOOGLE').
 * @param apiKey - The full API key for the provider.
 * @returns An instance of the AI SDK provider for the specified provider.
 * @throws {AppError} If the provider is unsupported.
 */
export function createAIClient(provider: ProviderType, apiKey: string) {
	switch (provider) {
		case "OPENAI":
			return createOpenAI({ apiKey });
		case "ANTHROPIC":
			return createAnthropic({ apiKey });
		case "GOOGLE":
			return createGoogleGenerativeAI({ apiKey });
		default: {
			// Ensure exhaustive check at compile time
			const _: never = provider;
			throw createError(
				ErrorCode.INTERNAL_ERROR,
				`Unsupported AI provider: ${provider}`,
			);
		}
	}
}
