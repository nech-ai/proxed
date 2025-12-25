import { InviteMemberForm } from "@/components/settings/team/members/invite-member-form";
import { TeamMembersBlock } from "@/components/settings/team/members/team-members";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export async function generateMetadata() {
	return {
		title: "Team Members | Proxed",
	};
}

export default async function TeamMembersPage() {
	batchPrefetch([
		trpc.team.members.queryOptions(),
		trpc.team.invites.queryOptions(),
	]);

	return (
		<HydrateClient>
			<div className="grid grid-cols-1 gap-6">
				<InviteMemberForm />
				<TeamMembersBlock />
			</div>
		</HydrateClient>
	);
}
