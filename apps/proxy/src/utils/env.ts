/**
 * Typed environment variable helpers
 */

export interface ProxyEnv {
	// Database
	DATABASE_PRIMARY_URL: string;
	DATABASE_LHR_URL?: string;
	SUPABASE_JWT_SECRET: string;

	// OpenAI
	OPENAI_API_BASE?: string;
	OPENAI_MAX_RETRIES?: string;
	OPENAI_RETRY_DELAY?: string;
	OPENAI_TIMEOUT?: string;
	OPENAI_DEBUG?: string;

	// Anthropic
	ANTHROPIC_API_BASE?: string;
	ANTHROPIC_MAX_RETRIES?: string;
	ANTHROPIC_RETRY_DELAY?: string;
	ANTHROPIC_TIMEOUT?: string;
	ANTHROPIC_DEBUG?: string;

	// General
	NODE_ENV?: string;
	LOG_LEVEL?: string;
	PORT?: string;
	SUPPRESS_WAITUNTIL_WARNING?: string;

	// Platform specific
	FLY_REGION?: string;
	VERCEL_ENV?: string;
	CF_PAGES?: string;
}

/**
 * Get a required environment variable
 */
export function getRequiredEnv(key: keyof ProxyEnv): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getEnv(
	key: keyof ProxyEnv,
	defaultValue?: string,
): string | undefined {
	return process.env[key] || defaultValue;
}

/**
 * Get a numeric environment variable
 */
export function getNumericEnv(
	key: keyof ProxyEnv,
	defaultValue: number,
): number {
	const value = process.env[key];
	if (!value) return defaultValue;

	const parsed = Number(value);
	if (Number.isNaN(parsed)) {
		console.warn(
			`Invalid numeric value for ${key}: ${value}, using default: ${defaultValue}`,
		);
		return defaultValue;
	}

	return parsed;
}

/**
 * Get a boolean environment variable
 */
export function getBooleanEnv(
	key: keyof ProxyEnv,
	defaultValue = false,
): boolean {
	const value = process.env[key];
	if (!value) return defaultValue;

	return value.toLowerCase() === "true" || value === "1";
}

/**
 * Validate required environment variables on startup
 */
export function validateEnv(): void {
	const required: (keyof ProxyEnv)[] = [
		"DATABASE_PRIMARY_URL",
		"SUPABASE_JWT_SECRET",
	];

	const missing = required.filter((key) => !process.env[key]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}
}
