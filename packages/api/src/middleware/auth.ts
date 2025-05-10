import { createClient } from "@proxed/supabase/api";
import {
	getProjectQuery,
	getTeamLimitsMetricsQuery,
} from "@proxed/supabase/queries";
import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareVariables } from "../types";
import { verifyDeviceCheckToken } from "../utils/verify-device-check";
import { AppError, createError, ErrorCode } from "../utils/errors";
import { parseCombinedToken } from "../utils/token-parser";

export const authMiddleware = createMiddleware<{
	Variables: AuthMiddlewareVariables;
}>(async (c, next) => {
	const supabase = await createClient();

	// Get tokens from headers
	const deviceToken = c.req.header("x-device-token");
	const testKey = c.req.header("x-proxed-test-key");
	const fromParam = c.req.param("projectId");
	const fromHeader = c.req.header("x-project-id");
	const projectId = fromParam || fromHeader;
	const authHeader = c.req.header("Authorization");
	const partialApiKey = c.req.header("x-ai-key");

	if (!projectId) {
		throw createError(ErrorCode.MISSING_PROJECT_ID);
	}

	// Require partial API key for all valid auth paths except potentially the legacy deviceToken flow
	// if (!partialApiKey) {
	//   // Decide if this should be an error. If the routes ALWAYS need it, uncomment this.
	// 	 throw createError(ErrorCode.UNAUTHORIZED, "Missing x-ai-key header");
	// }

	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error || !project) {
		// Added !project check for type safety
		throw createError(ErrorCode.PROJECT_NOT_FOUND);
	}

	// Check test key from header first (separate from Bearer token)
	if (testKey && project.test_mode && testKey === project.test_key) {
		if (!partialApiKey) {
			// Check if x-ai-key is present for this flow
			throw createError(
				ErrorCode.UNAUTHORIZED,
				"Missing x-ai-key header for test key auth",
			);
		}
		c.set("session", {
			teamId: project.team_id,
			projectId,
			token: testKey, // Using the test key itself as the token identifier
			apiKey: partialApiKey, // Store partial API key
		});
		await next();
		return;
	}

	const { data: limits } = await getTeamLimitsMetricsQuery(
		supabase,
		project.team_id,
	);
	if (!limits) {
		throw createError(ErrorCode.UNAUTHORIZED, "No billing information found");
	}

	// Check API calls limit
	if (
		limits.api_calls_limit &&
		limits.api_calls_used >= limits.api_calls_limit
	) {
		throw createError(
			ErrorCode.FORBIDDEN,
			"API calls limit reached for your current plan",
		);
	}

	// Handle concatenated token in Authorization header
	if (authHeader?.startsWith("Bearer ")) {
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
		if (project.test_mode && bearerTokenPart === project.test_key) {
			c.set("session", {
				teamId: project.team_id,
				projectId,
				token: bearerTokenPart, // The test key itself was used for auth
				apiKey: bearerApiKeyPart, // Use the part from the Bearer token as the partial API key
			});
			await next();
			return;
		}

		// If not test mode or test key doesn't match, proceed with device check
		if (!project.device_check) {
			throw createError(
				ErrorCode.INVALID_TOKEN,
				"Invalid authentication credentials",
			);
		}

		try {
			const isValid = await verifyDeviceCheckToken(
				Buffer.from(bearerTokenPart, "base64"),
				project.device_check,
			);

			if (!isValid) {
				throw createError(
					ErrorCode.INVALID_TOKEN,
					"Invalid authentication credentials",
				);
			}

			c.set("session", {
				teamId: project.team_id,
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

	// Handle separate device token (legacy or specific use case?)
	// This part might need reconsideration if the Bearer token is the ONLY way forward.
	if (deviceToken && project.device_check) {
		try {
			const isValid = await verifyDeviceCheckToken(
				Buffer.from(deviceToken, "base64"),
				project.device_check,
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
				teamId: project.team_id,
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
});
