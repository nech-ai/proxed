import type { FinishReason } from "../rest/types";
import { logger } from "./logger";

/**
 * OpenAI API response type (simplified)
 */
export interface OpenAIResponse {
	usage?: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
	choices?: Array<{
		finish_reason?: string;
	}>;
	[key: string]: unknown;
}

/**
 * Maps OpenAI finish reason to our standardized finish reason
 */
export function mapOpenAIFinishReason(
	openaiReason: string | undefined,
): FinishReason {
	if (!openaiReason) return "unknown";

	// Map OpenAI's finish reasons to our enum
	switch (openaiReason) {
		case "stop":
			return "stop";
		case "length":
			return "length";
		case "content_filter":
			return "content-filter";
		case "function_call":
		case "tool_calls":
			return "tool-calls";
		default:
			// If it's an unexpected value, log it for potential future mapping
			if (openaiReason !== "unknown") {
				logger.info(`Unmapped OpenAI finish reason: ${openaiReason}`);
			}
			return (openaiReason as FinishReason) || "unknown";
	}
}
