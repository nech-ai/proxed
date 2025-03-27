"use server";
import { updateTeam } from "@proxed/supabase/mutations";
import {
	revalidatePath as nextRevalidatePath,
	revalidateTag,
} from "next/cache";
import { authActionClient } from "./safe-action";
import { updateTeamSchema } from "./schema";
import { LogEvents } from "@proxed/analytics";

export const updateTeamAction = authActionClient
	.schema(updateTeamSchema)
	.metadata({
		name: "updateTeamAction",
		track: LogEvents.UpdateTeam,
	})
	.action(
		async ({
			parsedInput: { revalidatePath, ...data },
			ctx: { user, supabase },
		}) => {
			await updateTeam(supabase, data);

			revalidateTag(`teams_${user.id}`);

			if (revalidatePath) {
				nextRevalidatePath(revalidatePath);
			}

			return user;
		},
	);
