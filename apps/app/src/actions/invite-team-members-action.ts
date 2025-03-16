"use server";
import { sendEmail } from "@proxed/mail";
import { getBaseUrl } from "@proxed/utils";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { inviteTeamMembersSchema } from "./schema";
import { redirect } from "next/navigation";

export const inviteTeamMembersAction = authActionClient
	.schema(inviteTeamMembersSchema)
	.action(
		async ({
			parsedInput: { revalidatePath, redirectTo, invites },
			ctx: { user, supabase },
		}) => {
			if (!user.team_id) {
				throw new Error("User is not in a team");
			}
			for (const invite of invites) {
				const invitationData = {
					...invite,
					team_id: user.team_id,
					invited_by_id: user.id,
					created_at: new Date().toISOString(),
					expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
				};

				const { data: invitation } = await supabase
					.from("team_invitations")
					.insert({ ...invitationData, email: invite.email })
					.select("id,email, invited_by:users(*), team:teams(*)")
					.single();

				if (!invitation) {
					throw new Error("Failed to invite team member");
				}

				await sendEmail({
					templateId: "teamInvitation",
					to: invitation.email,
					context: {
						url: `${getBaseUrl()}/team/invitation?code=${invitation.id}`,
						teamName: invitation.team?.name ?? "",
					},
				});
			}

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}
			if (redirectTo) {
				redirect(redirectTo);
			}
		},
	);
