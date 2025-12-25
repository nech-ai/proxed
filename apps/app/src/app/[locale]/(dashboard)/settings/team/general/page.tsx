import { ChangeTeamAvatar } from "@/components/settings/team/general/change-team-avatar";
import { DeleteTeam } from "@/components/settings/team/general/delete-team";
import { DisplayTeamName } from "@/components/settings/team/general/display-team-name";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export async function generateMetadata() {
	return {
		title: "Team Settings | Proxed",
	};
}

export default async function TeamSettingsPage() {
	batchPrefetch([trpc.user.me.queryOptions()]);

	return (
		<HydrateClient>
			<div className="grid grid-cols-1 gap-6">
				<ChangeTeamAvatar />
				<DisplayTeamName />
				<DeleteTeam />
			</div>
		</HydrateClient>
	);
}
