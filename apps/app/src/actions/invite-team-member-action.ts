"use server";
import { sendEmail } from "@proxed/mail";
import { getBaseUrl } from "@proxed/utils";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { inviteTeamMemberSchema } from "./schema";
import { LogEvents } from "@proxed/analytics";

export const inviteTeamMemberAction = authActionClient
	.schema(inviteTeamMemberSchema)
	.metadata({
		name: "inviteTeamMemberAction",
		track: LogEvents.InviteTeamMember,
	})
	.action(
		async ({
			parsedInput: { revalidatePath, ...data },
			ctx: { user, supabase },
		}) => {
			if (!user.team_id) {
				throw new Error("User is not in a team");
			}

			const invitationData = {
				...data,
				team_id: user.team_id,
				invited_by_id: user.id,
				created_at: new Date().toISOString(),
				expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
			};

			const { data: invitation } = await supabase
				.from("team_invitations")
				.insert({ ...invitationData, email: data.email })
				.select("id,email, invited_by:users(*), team:teams(*)")
				.single();

			if (!invitation) {
				throw new Error("Failed to invite team member");
			}

			await sendEmail({
				templateId: "teamInvitation",
				to: invitation.email,
				context: {
					url: `${getBaseUrl()}/team/invitation/${invitation.id}`,
					teamName: invitation.team?.name ?? "",
				},
			});

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}
		},
	);
