import { createClient } from "@proxed/supabase/api";
import { getProjectQuery } from "@proxed/supabase/queries";
import { createMiddleware } from "hono/factory";
import type { AuthMiddlewareVariables } from "../types";
import { verifyDeviceCheckToken } from "../utils/verify-device-check";

export const authMiddleware = createMiddleware<{
	Variables: AuthMiddlewareVariables;
}>(async (c, next) => {
	const supabase = await createClient();

	const deviceToken = c.req.header("X-Device-Token");
	const projectId = c.req.header("X-Project-Id");

	if (!deviceToken || !projectId) {
		return c.json({ error: "Missing device token or project id" }, 401);
	}

	const { data: project, error } = await getProjectQuery(supabase, projectId);

	if (error || !project || !project.device_check) {
		return c.json({ error: "Project not found" }, 401);
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
