"use server";

import { createClient } from "@proxed/supabase/api";
import { acceptInvitation } from "@proxed/supabase/mutations";
import { getTeamInviteQuery } from "@proxed/supabase/queries";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { authActionClient } from "./safe-action";
import { acceptInvitationSchema } from "./schema";
import { LogEvents } from "@proxed/analytics";

export const acceptInvitationAction = authActionClient
	.schema(acceptInvitationSchema)
	.metadata({
		name: "acceptInvitationAction",
		track: LogEvents.AcceptInvitation,
	})
	.action(
		async ({ parsedInput: { invitationId, redirectTo }, ctx: { user } }) => {
			const supaSupabase = createClient();

			const { data: invitation, error: inviteError } = await getTeamInviteQuery(
				supaSupabase,
				invitationId,
			);

			if (inviteError || !invitation) {
				throw new Error("Invitation not found or invalid.");
			}

			if (invitation.email !== user.email) {
				console.error(
					`Auth mismatch: Invite ${invitationId} for ${invitation.email}, user ${user.id} is ${user.email}`,
				);
				throw new Error("You are not authorized to accept this invitation.");
			}

			try {
				await acceptInvitation(supaSupabase, {
					invitationId,
					userId: user.id,
				});
			} catch (acceptError) {
				console.error("Error accepting invitation:", acceptError);
				throw new Error(
					acceptError instanceof Error
						? acceptError.message
						: "Failed to accept invitation.",
				);
			}

			revalidateTag(`user_${user.id}`);
			revalidateTag(`teams_${user.id}`);
			if (invitation.team_id) {
				revalidateTag(`team_members_${invitation.team_id}`);
				revalidateTag(`team_invites_${invitation.team_id}`);
			}
			revalidatePath("/");

			if (redirectTo) {
				redirect(redirectTo);
			} else {
				redirect("/");
			}
		},
	);
