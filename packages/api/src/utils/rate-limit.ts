import type { Context } from "hono";
import { logger } from "@proxed/logger";
import { sendHighConsumptionNotification } from "@proxed/jobs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@proxed/supabase/types";
import { safeWaitUntil } from "./execution-context";

interface CheckRateLimitParams {
	c: Context<any>;
	supabase: SupabaseClient<Database>;
	projectId: string;
	teamId: string;
	projectName: string;
	// timeWindowSeconds and callThreshold are removed as they are now fetched from the project
}

/**
 * Checks the project's execution rate limit and triggers a notification job if the threshold is met.
 * This runs as a background task using safeWaitUntil.
 * The threshold and interval are read directly from the project settings in the database.
 */
export function checkAndNotifyRateLimit({
	c,
	supabase,
	projectId,
	teamId,
	projectName,
}: CheckRateLimitParams): void {
	safeWaitUntil(
		c,
		(async () => {
			// Fetch project settings to pass to the job payload if needed
			// We still need them here if the job needs the specific values
			const { data: projectSettings, error: settingsError } = await supabase
				.from("projects")
				.select("notification_threshold, notification_interval_seconds")
				.eq("id", projectId)
				.single();

			if (settingsError) {
				logger.error("Failed to fetch project notification settings", {
					projectId,
					error: settingsError.message,
				});
				return;
			}

			// Call the RPC function which now handles checking based on DB settings
			const { data: shouldNotify, error: rpcError } = await supabase.rpc(
				"check_and_notify_rate_limit",
				{
					p_project_id: projectId,
					p_team_id: teamId, // Pass team_id as the function still expects it
				},
			);

			if (rpcError) {
				logger.error("Failed to check project rate limit via RPC", {
					projectId,
					teamId,
					error: rpcError.message,
				});
				return;
			}

			// If shouldNotify is true and settings were fetched successfully
			if (
				shouldNotify &&
				projectSettings?.notification_threshold &&
				projectSettings?.notification_interval_seconds
			) {
				await sendHighConsumptionNotification.trigger({
					projectId,
					teamId,
					projectName: projectName,
					threshold: projectSettings.notification_threshold,
					timeWindowSeconds: projectSettings.notification_interval_seconds,
					// TODO: currentRate might need separate calculation if required by the job accurately
					currentRate: projectSettings.notification_threshold, // Using threshold as placeholder
				});
				logger.info("High consumption notification triggered for project", {
					projectId,
					teamId,
					threshold: projectSettings.notification_threshold,
				});
			}
		})(),
	);
}
