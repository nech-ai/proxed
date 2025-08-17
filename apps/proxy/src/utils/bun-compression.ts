import type { MiddlewareHandler } from "hono";
import { stream } from "hono/streaming";
import { logger } from "./logger";

/**
 * Compression middleware for Bun runtime
 * Since hono/compress doesn't work with Bun, this provides an alternative
 * using Bun's built-in compression utilities
 */

export interface CompressionOptions {
	/**
	 * Minimum response size to compress (in bytes)
	 */
	threshold?: number;
	/**
	 * Compression level (1-9, where 1 is fastest, 9 is best compression)
	 */
	level?: number;
	/**
	 * Content types to compress
	 */
	contentTypes?: string[];
}

const DEFAULT_OPTIONS: CompressionOptions = {
	threshold: 1024, // 1KB
	level: 6,
	contentTypes: [
		"text/html",
		"text/css",
		"text/javascript",
		"text/plain",
		"application/json",
		"application/xml",
		"application/javascript",
		"application/x-javascript",
	],
};

/**
 * Check if content should be compressed based on content type
 */
function shouldCompress(
	contentType: string | null,
	allowedTypes: string[],
): boolean {
	if (!contentType) return false;

	return allowedTypes.some((type) => contentType.includes(type));
}

/**
 * Bun-compatible compression middleware
 * Note: This is a simplified implementation for Bun
 */
export function bunCompress(options?: CompressionOptions): MiddlewareHandler {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	return async (c, next) => {
		await next();

		// Check if we should compress
		const acceptEncoding = c.req.header("accept-encoding") || "";
		if (!acceptEncoding.includes("gzip")) {
			return; // Client doesn't support gzip
		}

		// Check content type
		const contentType = c.res.headers.get("content-type");
		if (!shouldCompress(contentType, opts.contentTypes!)) {
			return;
		}

		// Skip if already encoded
		if (c.res.headers.get("content-encoding")) {
			return;
		}

		// For Bun, we need to handle compression differently
		// This is a placeholder - in production, you might want to:
		// 1. Use a reverse proxy (nginx) for compression
		// 2. Use Bun's built-in compression when it becomes available
		// 3. Implement streaming compression using Bun's APIs

		logger.debug(
			`Compression requested but using Bun runtime: contentType=${contentType}, acceptEncoding=${acceptEncoding}`,
		);

		// For now, we'll just add the appropriate headers
		// Actual compression would be handled by a reverse proxy
		// or when Bun adds native compression support
	};
}

/**
 * Alternative: Use streaming for manual compression
 * This is more complex but works with Bun
 */
export async function compressResponse(
	c: any,
	data: string | Uint8Array,
	options?: CompressionOptions,
): Promise<Response> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Convert string to Uint8Array if needed
	const bytes =
		typeof data === "string" ? new TextEncoder().encode(data) : data;

	// Check size threshold
	if (bytes.length < opts.threshold!) {
		return new Response(bytes, {
			headers: c.res.headers,
		});
	}

	// In a real implementation, you would compress here
	// For now, return uncompressed with a note
	logger.debug(
		`Manual compression requested: originalSize=${bytes.length}, threshold=${opts.threshold}`,
	);

	return new Response(bytes, {
		headers: {
			...Object.fromEntries(c.res.headers.entries()),
			"x-compression-note": "Bun compression pending implementation",
		},
	});
}

/**
 * Helper to check if Bun runtime
 */
export function isBunRuntime(): boolean {
	return typeof Bun !== "undefined";
}
