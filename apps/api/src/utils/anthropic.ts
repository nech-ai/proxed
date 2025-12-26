import { logger } from "../utils/logger";
import type { FinishReason } from "../rest/types";

/**
 * Anthropic API response type (simplified)
 * Based on https://docs.anthropic.com/en/api/messages
 */
export interface AnthropicResponse {
	usage?: {
		input_tokens: number;
		output_tokens: number; // Anthropic uses output_tokens
	};
	stop_reason?: string | null; // Anthropic's term for finish_reason
	// Other fields like id, model, role, type, content can be added if needed
	[key: string]: unknown;
}

/**
 * Maps Anthropic finish reason to our standardized finish reason
 */
export function mapAnthropicFinishReason(
	anthropicReason: string | null | undefined,
): FinishReason {
	if (!anthropicReason) return "unknown";

	// Map Anthropic's finish reasons to our enum
	// Reference: https://docs.anthropic.com/en/api/messages (search for "stop_reason")
	switch (anthropicReason) {
		case "end_turn":
			return "stop";
		case "max_tokens":
			return "length";
		case "tool_use":
			return "tool-calls";
		case "stop_sequence": // maps to "stop" as it's a deliberate stop
			return "stop";
		// Anthropic also has "pause_turn" and "refusal" which might need specific handling
		// For now, they can fall into the default "unknown" or "other"
		default:
			// If it's an unexpected value, log it for potential future mapping
			if (anthropicReason !== "unknown") {
				logger.info(`Unmapped Anthropic finish reason: ${anthropicReason}`);
			}
			return (anthropicReason as FinishReason) || "unknown";
	}
}
