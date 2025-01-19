"use server";
import { updateTeam } from "@proxed/supabase/mutations";
import {
	revalidatePath as nextRevalidatePath,
	revalidateTag,
} from "next/cache";
import { authActionClient } from "./safe-action";
import { updateTeamSchema } from "./schema";

export const updateTeamAction = authActionClient
	.schema(updateTeamSchema)
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
