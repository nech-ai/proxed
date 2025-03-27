"use server";

import { updateUser } from "@proxed/supabase/mutations";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { authActionClient } from "./safe-action";
import { changeTeamSchema } from "./schema";

export const changeTeamAction = authActionClient
	.schema(changeTeamSchema)
	.metadata({
		name: "changeTeamAction",
		track: {
			event: "change_team",
			channel: "change_team",
		},
	})
	.action(
		async ({ parsedInput: { teamId, redirectTo }, ctx: { supabase } }) => {
			const user = await updateUser(supabase, { team_id: teamId });

			if (!user?.data) {
				return;
			}

			revalidateTag(`user_${user.data.id}`);
			revalidateTag(`teams_${user.data.id}`);

			redirect(redirectTo);
		},
	);
