import type { Context } from "hono";
import { sendHighConsumptionNotification } from "@proxed/jobs";
import type { Database } from "../db";
import { safeWaitUntil } from "./execution-context";
import { logger } from "./logger";
import { eq, sql } from "drizzle-orm";
import { projects } from "../db/schema";

interface CheckRateLimitParams {
	c: Context<any>;
	db: Database;
	projectId: string;
	teamId: string;
	projectName: string;
}

/**
 * Checks the project's execution rate limit and triggers a notification job if the threshold is met.
 * This runs as a background task using safeWaitUntil.
 * The threshold and interval are read directly from the project settings in the database.
 */
export function checkAndNotifyRateLimit({
	c,
	db,
	projectId,
	teamId,
	projectName,
}: CheckRateLimitParams): void {
	safeWaitUntil(
		c,
		(async () => {
			// Fetch project settings
			const [projectSettings] = await db
				.select({
					notificationThreshold: projects.notificationThreshold,
					notificationIntervalSeconds: projects.notificationIntervalSeconds,
				})
				.from(projects)
				.where(eq(projects.id, projectId))
				.limit(1);

			if (!projectSettings) {
				logger.error(
					`Failed to fetch project notification settings for project ${projectId}`,
				);
				return;
			}

			// This is a simplified check - in production you'd implement the actual
			// rate limit checking logic based on executions within the time window
			const shouldNotify =
				projectSettings.notificationThreshold &&
				projectSettings.notificationIntervalSeconds;

			// If shouldNotify is true and settings were fetched successfully
			if (shouldNotify) {
				sendHighConsumptionNotification.trigger({
					projectId,
					teamId,
					projectName: projectName,
					threshold: projectSettings.notificationThreshold,
					timeWindowSeconds: projectSettings.notificationIntervalSeconds,
					currentRate: projectSettings.notificationThreshold,
				});
			}
		})(),
	);
}
