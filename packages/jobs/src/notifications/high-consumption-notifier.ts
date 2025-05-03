import { createClient } from "@proxed/supabase/job";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import {
	NotificationTypes,
	TriggerEvents,
	triggerBulk,
} from "@proxed/notifications";

export const highConsumptionPayloadSchema = z.object({
	projectId: z.string().uuid(),
	teamId: z.string().uuid(),
	projectName: z.string(),
	threshold: z.number(),
	timeWindowSeconds: z.number(),
	currentRate: z.number(),
});

export const sendHighConsumptionNotification = schemaTask({
	id: "high-consumption-notifier",
	schema: highConsumptionPayloadSchema,
	run: async (payload) => {
		const {
			projectId,
			teamId,
			projectName,
			threshold,
			timeWindowSeconds,
			currentRate,
		} = payload;
		const supabase = createClient();

		const { data: users, error: userError } = await supabase
			.from("team_memberships")
			.select("id, team_id, user:users(id, full_name, email)")
			.eq("team_id", teamId);

		if (userError || !users || users.length === 0) {
			return;
		}

		const notificationEvents = users
			.map(({ user, team_id }) => {
				if (!user || !user.email) {
					logger.warn("Skipping user due to missing info", {
						userId: user?.id,
						teamId,
					});
					return null;
				}

				return {
					name: TriggerEvents.HighConsumption,
					payload: {
						type: NotificationTypes.Alerts,
						projectName: projectName,
						recordId: projectId,
						threshold: threshold,
						timeWindowSeconds: timeWindowSeconds,
						currentRate: currentRate,
						teamId: teamId,
					},
					user: {
						subscriberId: user.id,
						teamId: team_id,
						email: user.email,
						fullName: user.full_name ?? undefined,
					},
				};
			})
			.filter(Boolean) as any[];

		if (notificationEvents.length === 0) {
			return;
		}

		try {
			await triggerBulk(notificationEvents);
		} catch (error) {
			logger.error("Failed to trigger bulk high consumption notifications", {
				error: error instanceof Error ? error.message : String(error),
				teamId,
				projectId,
			});
		}
	},
});
