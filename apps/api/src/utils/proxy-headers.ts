/**
 * Headers that should be blocked from being forwarded to upstream APIs
 */
export const BLOCKED_REQUEST_HEADERS = new Set([
	// Host and forwarding headers
	"host",
	"x-forwarded-for",
	"x-forwarded-host",
	"x-forwarded-proto",
	"x-real-ip",
	"forwarded",

	// Authentication headers (we set our own)
	"authorization",
	"x-api-key",

	// Platform-specific headers
	"x-proxed-test-key",
	"x-ai-key",
	"x-project-id",
	"x-device-token",

	// Cloudflare headers
	"cf-connecting-ip",
	"cf-ipcountry",
	"cf-ipcontinent",
	"cf-ray",
	"cf-visitor",
	"cf-request-id",
	"cf-worker",

	// Vercel headers
	"x-vercel-id",
	"x-vercel-forwarded-for",
	"x-vercel-deployment-url",
	"x-vercel-trace",
	"x-vercel-proxied-for",

	// AWS headers
	"x-amzn-trace-id",
	"x-amz-cf-id",

	// Other proxy headers
	"via",
	"x-cache",
	"x-cache-hits",
]);

/**
 * Headers that should be forwarded from the response
 */
export const ALLOWED_RESPONSE_HEADERS = new Set([
	"content-type",
	"content-encoding",
	"content-length",
	"x-request-id",
	"x-ratelimit-limit",
	"x-ratelimit-remaining",
	"x-ratelimit-reset",
	"x-ratelimit-reset-after",
	"retry-after",
	"openai-organization",
	"openai-processing-ms",
	"openai-version",
]);

/**
 * Sanitize request headers for proxying
 */
export function sanitizeRequestHeaders(
	originalHeaders: Record<string, string | undefined>,
	overrides: Record<string, string | undefined>,
): Record<string, string | undefined> {
	const sanitized: Record<string, string | undefined> = {};

	// First, copy allowed headers from original
	for (const [key, value] of Object.entries(originalHeaders)) {
		if (
			!BLOCKED_REQUEST_HEADERS.has(key.toLowerCase()) &&
			value !== undefined
		) {
			sanitized[key] = value;
		}
	}

	// Then apply overrides (including setting undefined to remove)
	for (const [key, value] of Object.entries(overrides)) {
		if (value === undefined) {
			delete sanitized[key];
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
}

/**
 * Filter response headers to only include allowed ones
 */
export function filterResponseHeaders(headers: Headers): Headers {
	const filtered = new Headers();

	headers.forEach((value, key) => {
		if (ALLOWED_RESPONSE_HEADERS.has(key.toLowerCase())) {
			filtered.set(key, value);
		}
	});

	return filtered;
}
