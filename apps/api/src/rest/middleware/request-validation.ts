import type { MiddlewareHandler } from "hono";
import { createError, ErrorCode } from "../../utils/errors";
import { logger } from "../../utils/logger";

const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_URL_LENGTH = 2048;
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const DANGEROUS_HEADERS = new Set([
	"x-forwarded-for",
	"x-forwarded-host",
	"x-forwarded-proto",
	"forwarded",
	"via",
]);

/**
 * Validates incoming requests for security concerns
 */
export const requestValidation: MiddlewareHandler = async (c, next) => {
	const method = c.req.method;
	const url = c.req.url;
	const contentLength = c.req.header("content-length");

	// Validate HTTP method
	if (!ALLOWED_METHODS.has(method)) {
		throw createError(ErrorCode.BAD_REQUEST, `Method ${method} not allowed`);
	}

	// Validate URL length
	if (url.length > MAX_URL_LENGTH) {
		throw createError(ErrorCode.BAD_REQUEST, "URL too long");
	}

	// Validate content length
	if (contentLength) {
		const size = Number.parseInt(contentLength, 10);
		if (Number.isNaN(size) || size > MAX_REQUEST_SIZE) {
			throw createError(
				ErrorCode.BAD_REQUEST,
				`Request body too large. Maximum size is ${MAX_REQUEST_SIZE} bytes`,
			);
		}
	}

	// Check for suspicious headers
	const suspiciousHeaders: string[] = [];
	for (const [key] of Object.entries(c.req.header())) {
		if (DANGEROUS_HEADERS.has(key.toLowerCase())) {
			// Check if header has been tampered with
			const value = c.req.header(key);
			if (value?.includes("\n") || value?.includes("\r")) {
				suspiciousHeaders.push(key);
			}
		}
	}

	if (suspiciousHeaders.length > 0) {
		logger.warn(
			`Suspicious headers detected: headers=${JSON.stringify(suspiciousHeaders)}, ip=${c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")}, userAgent=${c.req.header("user-agent")}`,
		);
	}

	// Validate content-type for methods that require body
	if (["POST", "PUT", "PATCH"].includes(method)) {
		const contentType = c.req.header("content-type");
		if (!contentType) {
			throw createError(
				ErrorCode.BAD_REQUEST,
				"Content-Type header is required for requests with body",
			);
		}

		// Ensure content-type is valid
		const validContentTypes = [
			"application/json",
			"application/x-www-form-urlencoded",
			"multipart/form-data",
			"text/plain",
		];

		const hasValidContentType = validContentTypes.some((type) =>
			contentType.toLowerCase().includes(type),
		);

		if (!hasValidContentType) {
			throw createError(
				ErrorCode.BAD_REQUEST,
				`Invalid Content-Type: ${contentType}`,
			);
		}
	}

	// Check for request smuggling attempts
	const transferEncoding = c.req.header("transfer-encoding");
	const contentLengthHeader = c.req.header("content-length");

	if (transferEncoding && contentLengthHeader) {
		// Having both Transfer-Encoding and Content-Length is suspicious
		logger.warn(
			`Potential request smuggling attempt: transferEncoding=${transferEncoding}, contentLength=${contentLengthHeader}, ip=${c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")}`,
		);

		throw createError(ErrorCode.BAD_REQUEST, "Invalid request headers");
	}

	await next();
};
