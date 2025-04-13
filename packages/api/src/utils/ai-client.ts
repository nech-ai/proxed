import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { Provider } from "../types";
import { createError, ErrorCode } from "./errors";

/**
 * Creates an AI SDK client instance based on the specified provider.
 * @param provider - The AI provider ('OPENAI' or 'ANTHROPIC').
 * @param apiKey - The full API key for the provider.
 * @returns An instance of the AI SDK client for the specified provider.
 * @throws {AppError} If the provider is unsupported.
 */
export function createAIClient(provider: Provider, apiKey: string) {
	switch (provider) {
		case "OPENAI":
			return createOpenAI({ apiKey });
		case "ANTHROPIC":
			return createAnthropic({ apiKey });
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
