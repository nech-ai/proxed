import type { Database } from "@proxed/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "../utils/auth";

export type Context = {
	Variables: {
		supabase: SupabaseClient<Database>;
		session: Session;
		teamId: string;
	};
};

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
export type Provider = "OPENAI" | "ANTHROPIC";

/**
 * Common parameters for execution tracking
 */
export type CommonExecutionParams = {
	teamId: string;
	projectId: string;
	deviceCheckId: string;
	keyId: string;
	ip: string | undefined;
	userAgent: string | undefined;
	model: string;
	provider: Provider;
	c: Context;
};
