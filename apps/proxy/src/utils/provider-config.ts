import type { ProviderType } from "../rest/types";
import { getEnv, getNumericEnv, getBooleanEnv } from "./env";

export interface ProviderConfig {
	/**
	 * Base URL for the provider's API
	 */
	baseUrl: string;
	/**
	 * Maximum number of retries for failed requests
	 */
	maxRetries: number;
	/**
	 * Base delay for retry backoff (in milliseconds)
	 */
	retryDelay: number;
	/**
	 * Request timeout (in milliseconds)
	 */
	timeout: number;
	/**
	 * Headers required by the provider
	 */
	requiredHeaders: string[];
	/**
	 * Optional headers that can be forwarded
	 */
	optionalHeaders: string[];
	/**
	 * Function to build auth headers
	 */
	buildAuthHeaders: (apiKey: string) => Record<string, string>;
	/**
	 * Whether to enable debug logging
	 */
	debug: boolean;
}

const OPENAI_CONFIG: ProviderConfig = {
	baseUrl: getEnv("OPENAI_API_BASE") || "https://api.openai.com/v1",
	maxRetries: getNumericEnv("OPENAI_MAX_RETRIES", 2),
	retryDelay: getNumericEnv("OPENAI_RETRY_DELAY", 1000),
	timeout: getNumericEnv("OPENAI_TIMEOUT", 120000), // 2 minutes
	requiredHeaders: ["content-type"],
	optionalHeaders: [
		"openai-organization",
		"openai-beta",
		"accept",
		"accept-encoding",
	],
	buildAuthHeaders: (apiKey: string) => ({
		Authorization: `Bearer ${apiKey}`,
	}),
	debug: getBooleanEnv("OPENAI_DEBUG", false),
};

const ANTHROPIC_CONFIG: ProviderConfig = {
	baseUrl: getEnv("ANTHROPIC_API_BASE") || "https://api.anthropic.com/v1",
	maxRetries: getNumericEnv("ANTHROPIC_MAX_RETRIES", 2),
	retryDelay: getNumericEnv("ANTHROPIC_RETRY_DELAY", 1000),
	timeout: getNumericEnv("ANTHROPIC_TIMEOUT", 120000), // 2 minutes
	requiredHeaders: ["content-type", "anthropic-version"],
	optionalHeaders: ["accept", "accept-encoding"],
	buildAuthHeaders: (apiKey: string) => ({
		"x-api-key": apiKey,
		"anthropic-version": "2023-06-01",
	}),
	debug: getBooleanEnv("ANTHROPIC_DEBUG", false),
};

export const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfig> = {
	OPENAI: OPENAI_CONFIG,
	ANTHROPIC: ANTHROPIC_CONFIG,
};

/**
 * Get configuration for a specific provider
 */
export function getProviderConfig(provider: ProviderType): ProviderConfig {
	const config = PROVIDER_CONFIGS[provider];
	if (!config) {
		throw new Error(`Unsupported provider: ${provider}`);
	}
	return config;
}

/**
 * Build headers for a provider request
 */
export function buildProviderHeaders(
	provider: ProviderType,
	apiKey: string,
	requestHeaders: Record<string, string | undefined>,
): Record<string, string | undefined> {
	const config = getProviderConfig(provider);
	const headers: Record<string, string | undefined> = {
		...config.buildAuthHeaders(apiKey),
	};

	// Add required headers with defaults
	if (!requestHeaders["content-type"]) {
		headers["Content-Type"] = "application/json";
	}

	// Forward optional headers if present
	for (const header of config.optionalHeaders) {
		const value = requestHeaders[header];
		if (value) {
			headers[header] = value;
		}
	}

	return headers;
}
