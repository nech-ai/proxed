import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareVariables } from "../types";
import { verifyDeviceCheckToken } from "../utils/verify-device-check";

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
		return c.json({ error: "Missing project id" }, 401);
	}

	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error) {
		return c.json({ error: "Project not found" }, 401);
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
			return c.json({ error: "Invalid authorization token format" }, 401);
		}

		try {
			const isValid = await verifyDeviceCheckToken(
				Buffer.from(deviceCheckToken, "base64"),
				project.device_check,
			);

			if (!isValid) {
				return c.json({ error: "Invalid device token" }, 401);
			}

			c.set("session", {
				teamId: project.team_id,
				projectId,
				token,
			});

			await next();
			return;
		} catch (error) {
			return c.json({ error: "Invalid device token" }, 401);
		}
	}

	// Handle separate device token
	if (!deviceToken || !project?.device_check) {
		return c.json({ error: "Missing device token" }, 401);
	}

	try {
		const isValid = await verifyDeviceCheckToken(
			Buffer.from(deviceToken, "base64"),
			project.device_check,
		);

		if (!isValid) {
			return c.json({ error: "Invalid device token" }, 401);
		}

		c.set("session", {
			teamId: project.team_id,
			projectId,
		});

		await next();
	} catch (error) {
		return c.json({ error: "Something went wrong" }, 500);
	}
});
