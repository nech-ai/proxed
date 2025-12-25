/**
 * Google AI (Gemini) utility functions
 */

import type { FinishReason } from "@proxed/utils/lib/providers";

/**
 * Google AI response structure for chat completions
 */
export interface GoogleResponse {
	candidates?: Array<{
		content?: {
			parts?: Array<{
				text?: string;
			}>;
			role?: string;
		};
		finishReason?: string;
		index?: number;
		safetyRatings?: Array<{
			category?: string;
			probability?: string;
		}>;
	}>;
	usageMetadata?: {
		promptTokenCount?: number;
		candidatesTokenCount?: number;
		totalTokenCount?: number;
	};
	modelVersion?: string;
}

/**
 * Map Google AI finish reasons to our standard finish reasons
 */
export function mapGoogleFinishReason(
	googleFinishReason?: string,
): FinishReason {
	switch (googleFinishReason) {
		case "STOP":
			return "stop";
		case "MAX_TOKENS":
			return "length";
		case "SAFETY":
		case "RECITATION":
		case "PROHIBITED_CONTENT":
			return "content-filter";
		case "OTHER":
			return "other";
		default:
			return "unknown";
	}
}
