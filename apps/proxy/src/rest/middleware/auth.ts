import { getTeamLimitsMetricsQuery } from "../../db/queries/teams";
import { verifyDeviceCheckToken } from "../../utils/verify-device-check";
import { AppError, createError, ErrorCode } from "../../utils/errors";
import { parseCombinedToken } from "../../utils/token-parser";
import type { MiddlewareHandler } from "hono";
import { getProjectQuery } from "../../db/queries/projects";
import type { Context } from "../types";

export const withAuth: MiddlewareHandler<Context> = async (c, next) => {
	const db = c.get("db");
	if (!db) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Database connection not available",
		);
	}

	// Get tokens from headers
	const deviceToken = c.req.header("x-device-token");
	const testKey = c.req.header("x-proxed-test-key");
	const fromParam = c.req.param("projectId");
	const fromHeader = c.req.header("x-project-id");
	const projectId = fromParam || fromHeader;
	const authHeader = c.req.header("Authorization");
	const partialApiKey = c.req.header("x-ai-key");

	if (!projectId) {
		throw createError(
			ErrorCode.MISSING_PROJECT_ID,
			"Project ID is required in either URL parameter or x-project-id header",
		);
	}

	// Validate project ID format (assuming UUID)
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(projectId)) {
		throw createError(ErrorCode.BAD_REQUEST, "Invalid project ID format");
	}

	// Require partial API key for all valid auth paths except potentially the legacy deviceToken flow
	// if (!partialApiKey) {
	//   // Decide if this should be an error. If the routes ALWAYS need it, uncomment this.
	// 	 throw createError(ErrorCode.UNAUTHORIZED, "Missing x-ai-key header");
	// }

	const project = await getProjectQuery(db, projectId);

	if (!project) {
		// Added !project check for type safety
		throw createError(ErrorCode.PROJECT_NOT_FOUND);
	}

	if (testKey && project.testMode && testKey === project.testKey) {
		// Check test key from header first (separate from Bearer token)
		if (!partialApiKey) {
			// Check if x-ai-key is present for this flow
			throw createError(
				ErrorCode.UNAUTHORIZED,
				"Missing x-ai-key header for test key auth",
			);
		}
		c.set("session", {
			teamId: project.teamId,
			projectId,
			token: testKey, // Using the test key itself as the token identifier
			apiKey: partialApiKey, // Store partial API key
		});
		await next();
		return;
	}

	const limits = await getTeamLimitsMetricsQuery(db, project.teamId);
	if (!limits) {
		throw createError(ErrorCode.UNAUTHORIZED, "No billing information found");
	}

	if (
		limits.api_calls_limit &&
		limits.api_calls_used >= limits.api_calls_limit
	) {
		// Check API calls limit
		throw createError(
			ErrorCode.FORBIDDEN,
			"API calls limit reached for your current plan",
		);
	}

	if (authHeader?.startsWith("Bearer ")) {
		// Handle concatenated token in Authorization header
		const combinedToken = authHeader.replace("Bearer ", "");
		const { apiKeyPart: bearerApiKeyPart, tokenPart: bearerTokenPart } =
			parseCombinedToken(combinedToken);

		if (!bearerApiKeyPart || !bearerTokenPart) {
			throw createError(
				ErrorCode.INVALID_TOKEN,
				"Invalid authorization token format. Expected 'apiKey.tokenPart'.",
			);
		}
		// Check if in test mode and tokenPart matches the test key
		if (project.testMode && bearerTokenPart === project.testKey) {
			c.set("session", {
				teamId: project.teamId,
				projectId,
				token: bearerTokenPart, // The test key itself was used for auth
				apiKey: bearerApiKeyPart, // Use the part from the Bearer token as the partial API key
			});
			await next();
			return;
		}

		// If not test mode or test key doesn't match, proceed with device check
		if (!project.deviceCheckId) {
			throw createError(
				ErrorCode.INVALID_TOKEN,
				"Invalid authentication credentials",
			);
		}

		try {
			const isValid = await verifyDeviceCheckToken(
				Buffer.from(bearerTokenPart, "base64"),
				project.deviceCheck,
			);

			if (!isValid) {
				throw createError(
					ErrorCode.INVALID_TOKEN,
					"Invalid authentication credentials",
				);
			}

			c.set("session", {
				teamId: project.teamId,
				projectId,
				token: bearerTokenPart, // The device token part used for auth
				apiKey: bearerApiKeyPart, // Use the part from the Bearer token as the partial API key
			});

			await next();
			return;
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			// Consider logging the original error for debugging
			console.error("Device check verification failed:", error);
			throw createError(
				ErrorCode.INVALID_TOKEN,
				"Device token verification failed",
			);
		}
	}

	if (deviceToken && project.deviceCheckId) {
		// Handle separate device token (legacy or specific use case?)
		// This part might need reconsideration if the Bearer token is the ONLY way forward.
		try {
			const isValid = await verifyDeviceCheckToken(
				Buffer.from(deviceToken, "base64"),
				project.deviceCheck,
			);

			if (!isValid) {
				throw createError(
					ErrorCode.INVALID_TOKEN,
					"Invalid authentication credentials",
				);
			}

			// Make x-ai-key required for legacy device token flow
			if (!partialApiKey) {
				throw createError(
					ErrorCode.UNAUTHORIZED,
					"Missing required credentials",
				);
			}

			c.set("session", {
				teamId: project.teamId,
				projectId,
				apiKey: partialApiKey, // Now guaranteed to exist
				// token: undefined // No token in this specific flow
			});

			await next();
			return;
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			console.error("Device check verification failed (header):", error);
			throw createError(ErrorCode.INTERNAL_ERROR, "Authentication failed");
		}
	}

	// If neither Bearer token nor separate device token is valid/present
	throw createError(ErrorCode.UNAUTHORIZED, "Invalid or missing credentials");
};

// Export as named export for consistency with the example
export const authMiddleware = withAuth;
