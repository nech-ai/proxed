import type { Context } from "hono";

export type AuthSession = {
	teamId: string;
	projectId: string;
	token?: string;
};

export interface AuthMiddlewareVariables {
	session: AuthSession;
}

export interface AppVariables extends AuthMiddlewareVariables {
	requestId?: string;
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
