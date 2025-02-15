import { InviteMemberForm } from "@/components/settings/team/members/invite-member-form";
import { TeamMembersBlock } from "@/components/settings/team/members/team-members";
import { getUser } from "@proxed/supabase/cached-queries";
import {
	getTeamInvitesQuery,
	getTeamMembersQuery,
} from "@proxed/supabase/queries";
import { createClient } from "@proxed/supabase/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
	return {
		title: "Team Members | Proxed",
	};
}

export default async function TeamMembersPage() {
	const supabase = await createClient();
	const userData = await getUser();

	if (!userData?.data) {
		redirect("/login");
	}

	if (!userData.data.team_id) {
		redirect("/settings/team/general");
	}

	const teamMembersData = await getTeamMembersQuery(
		supabase,
		userData.data.team_id,
	);

	const teamMembers = teamMembersData?.data ?? [];

	const teamInvitations = await getTeamInvitesQuery(
		supabase,
		userData.data.team_id,
	);

	return (
		<div className="grid grid-cols-1 gap-6">
			<InviteMemberForm revalidatePath="/settings/team/members" />
			<TeamMembersBlock
				memberships={teamMembers}
				invitations={teamInvitations ?? []}
			/>
		</div>
	);
}
