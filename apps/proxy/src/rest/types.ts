import type { Database } from "../db";
import type { GeoContext } from "../utils/geo";

export interface Session {
	teamId: string;
	projectId: string;
	token?: string;
	apiKey?: string;
}

export interface AuthMiddlewareVariables {
	session: Session;
	db: Database;
	teamId?: string | null;
	requestId?: string;
	geo: GeoContext;
}

export interface Context {
	Variables: AuthMiddlewareVariables;
}

/**
 * Standard finish reasons for AI model completions
 */
export type FinishReason =
	| "stop"
	| "length"
	| "content-filter"
	| "tool-calls"
	| "error"
	| "other"
	| "unknown";

/**
 * Provider types
 */
export type ProviderType = "OPENAI" | "ANTHROPIC";

/**
 * Common parameters for execution tracking
 */
export type CommonExecutionParams = {
	teamId: string;
	projectId: string;
	deviceCheckId: string | null | undefined;
	keyId: string | null | undefined;
	ip: string | undefined;
	userAgent: string | undefined;
	model: string | null;
	provider: ProviderType;
	countryCode?: string | null;
	regionCode?: string | null;
	city?: string | null;
	longitude?: number | null;
	latitude?: number | null;
};
