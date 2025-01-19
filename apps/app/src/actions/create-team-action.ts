"use server";
import { createTeam, updateUser } from "@proxed/supabase/mutations";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { authActionClient } from "./safe-action";
import { createTeamSchema } from "./schema";

export const createTeamAction = authActionClient
	.schema(createTeamSchema)
	.action(async ({ parsedInput: { name, redirectTo }, ctx: { supabase } }) => {
		const team_id = await createTeam(supabase, { name });
		const user = await updateUser(supabase, { team_id });

		if (!user?.data) {
			return;
		}

		revalidateTag(`user_${user.data.id}`);
		revalidateTag(`teams_${user.data.id}`);

		if (redirectTo) {
			redirect(redirectTo);
		}

		return team_id;
	});
