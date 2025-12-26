import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { createAnthropic, type AnthropicProvider } from "@ai-sdk/anthropic";
import {
	createGoogleGenerativeAI,
	type GoogleGenerativeAIProvider,
} from "@ai-sdk/google";
import type { ProviderType } from "../rest/types";
import { createError, ErrorCode } from "./errors";

/**
 * Creates an AI SDK client instance based on the specified provider.
 * Compatible with AI SDK v6.
 * @param provider - The AI provider ('OPENAI', 'ANTHROPIC', or 'GOOGLE').
 * @param apiKey - The full API key for the provider.
 * @returns An instance of the AI SDK provider for the specified provider.
 * @throws {AppError} If the provider is unsupported.
 */
export function createAIClient(
	provider: "OPENAI",
	apiKey: string,
): OpenAIProvider;
export function createAIClient(
	provider: "ANTHROPIC",
	apiKey: string,
): AnthropicProvider;
export function createAIClient(
	provider: "GOOGLE",
	apiKey: string,
): GoogleGenerativeAIProvider;
export function createAIClient(
	provider: ProviderType,
	apiKey: string,
): OpenAIProvider | AnthropicProvider | GoogleGenerativeAIProvider;
export function createAIClient(
	provider: ProviderType,
	apiKey: string,
): OpenAIProvider | AnthropicProvider | GoogleGenerativeAIProvider {
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
