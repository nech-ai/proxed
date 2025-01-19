"use server";

import { createClient } from "@proxed/supabase/api";
import { acceptInvitation } from "@proxed/supabase/mutations";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { authActionClient } from "./safe-action";
import { acceptInvitationSchema } from "./schema";

export const acceptInvitationAction = authActionClient
	.schema(acceptInvitationSchema)
	.action(
		async ({ parsedInput: { invitationId, redirectTo }, ctx: { user } }) => {
			const supaSupabase = createClient();
			await acceptInvitation(supaSupabase, {
				invitationId,
				userId: user.id,
			});

			revalidateTag(`user_${user.id}`);
			revalidateTag(`teams_${user.id}`);
			revalidateTag(`team_members_${user.team_id}`);
			revalidateTag(`team_invites_${user.team_id}`);
			revalidatePath("/");

			if (redirectTo) {
				redirect(redirectTo);
			}
		},
	);
