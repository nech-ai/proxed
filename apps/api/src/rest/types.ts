import type { Database } from "@proxed/db/client";
import type { GeoContext } from "../utils/geo";
import type {
	ProviderValue as ProviderType,
	FinishReason,
} from "@proxed/utils/lib/providers";

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

// Re-export types for backward compatibility
export type { ProviderType, FinishReason };

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
