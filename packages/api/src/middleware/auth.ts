import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareVariables } from "../types";
import { verifyDeviceCheckToken } from "../utils/verify-device-check";
import { AppError, createError, ErrorCode } from "../utils/errors";

export const authMiddleware = createMiddleware<{
	Variables: AuthMiddlewareVariables;
}>(async (c, next) => {
	const supabase = await createClient();

	// Get tokens from headers
	const deviceToken = c.req.header("x-device-token");
	const testKey = c.req.header("x-proxed-test-key");
	const projectId = c.req.param("projectId") || c.req.header("x-project-id");
	const authHeader = c.req.header("Authorization");

	if (!projectId) {
		throw createError(ErrorCode.MISSING_PROJECT_ID);
	}

	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error) {
		throw createError(ErrorCode.PROJECT_NOT_FOUND);
	}

	// Check test mode first
	if (project.test_mode && testKey === project.test_key) {
		c.set("session", {
			teamId: project.team_id,
			projectId,
		});
		await next();
		return;
	}

	// Handle concatenated token in Authorization header
	if (authHeader?.startsWith("Bearer ")) {
		const [token, deviceCheckToken] = authHeader
			.replace("Bearer ", "")
			.split(".");

		if (!token || !deviceCheckToken || !project?.device_check) {
			throw createError(
				ErrorCode.INVALID_TOKEN,
				"Invalid authorization token format",
			);
		}

		try {
			const isValid = await verifyDeviceCheckToken(
				Buffer.from(deviceCheckToken, "base64"),
				project.device_check,
			);

			if (!isValid) {
				throw createError(ErrorCode.INVALID_TOKEN, "Invalid device token");
			}

			c.set("session", {
				teamId: project.team_id,
				projectId,
				token,
			});

			await next();
			return;
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw createError(ErrorCode.INVALID_TOKEN, "Invalid device token");
		}
	}

	// Handle separate device token
	if (!deviceToken || !project?.device_check) {
		throw createError(ErrorCode.MISSING_DEVICE_TOKEN);
	}

	try {
		const isValid = await verifyDeviceCheckToken(
			Buffer.from(deviceToken, "base64"),
			project.device_check,
		);

		if (!isValid) {
			throw createError(ErrorCode.INVALID_TOKEN, "Invalid device token");
		}

		c.set("session", {
			teamId: project.team_id,
			projectId,
		});

		await next();
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		throw createError(ErrorCode.INTERNAL_ERROR, "Something went wrong");
	}
});
