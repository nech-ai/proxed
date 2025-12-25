import { createClient } from "@proxed/supabase/job";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod/v4";
import {
	NotificationTypes,
	TriggerEvents,
	triggerBulk,
} from "@proxed/notifications";

export const sendExecutionErrorNotifications = schemaTask({
	id: "execution-error",
	schema: z.object({
		executionId: z.uuid(),
		teamId: z.string(),
		model: z.string(),
		error: z.string(),
		errorMessage: z.string(),
	}),
	run: async ({ executionId, teamId, model, error, errorMessage }) => {
		const supabase = createClient();

		const { data: users } = await supabase
			.from("team_memberships")
			.select("id, team_id, user:users(id, full_name, email)")
			.eq("team_id", teamId);

		const executionErrorNotificationEvents = users
			?.map(({ user, team_id }) => {
				if (!user) {
					return null;
				}

				return {
					name: TriggerEvents.ExecutionError,
					payload: {
						type: NotificationTypes.Executions,
						name: user.full_name,
						recordId: executionId,
						model,
						errorType: error,
						errorMessage,
					},
					user: {
						subscriberId: user.id,
						teamId: team_id,
						email: user.email,
						fullName: user.full_name,
					},
				};
			})
			.filter(Boolean);

		try {
			await triggerBulk(executionErrorNotificationEvents);
		} catch (error) {
			await logger.error("Execution error notification", { error });
		}
	},
});
