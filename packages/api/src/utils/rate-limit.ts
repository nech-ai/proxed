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
	timeWindowSeconds?: number;
	callThreshold?: number;
}

/**
 * Checks the project's execution rate limit and triggers a notification job if the threshold is met.
 * This runs as a background task using safeWaitUntil.
 */
export function checkAndNotifyRateLimit({
	c,
	supabase,
	projectId,
	teamId,
	projectName,
	timeWindowSeconds = 300, // Default: 5 minutes
	callThreshold = 10, // Default: 10 calls
}: CheckRateLimitParams): void {
	safeWaitUntil(
		c,
		(async () => {
			// TODO: Figure out how to get currentRate accurately if needed for the job payload
			const currentRatePlaceholder = callThreshold; // Placeholder

			const { data: shouldNotify, error: rpcError } = await supabase.rpc(
				"check_and_notify_rate_limit",
				{
					p_project_id: projectId,
					p_team_id: teamId,
					p_time_window_seconds: timeWindowSeconds,
					p_call_threshold: callThreshold,
				},
			);

			if (rpcError) {
				logger.error("Failed to check project rate limit", {
					projectId,
					teamId,
					error: rpcError.message,
				});
				return;
			}

			if (shouldNotify) {
				// Consider if the job payload needs more accurate 'currentRate'
				await sendHighConsumptionNotification.trigger({
					projectId,
					teamId,
					projectName: projectName,
					threshold: callThreshold,
					timeWindowSeconds: timeWindowSeconds,
					currentRate: currentRatePlaceholder, // Use placeholder or adjust RPC
				});
				logger.info("High consumption notification triggered", {
					projectId,
					teamId,
					threshold: callThreshold,
				});
			}
		})(),
	);
}
