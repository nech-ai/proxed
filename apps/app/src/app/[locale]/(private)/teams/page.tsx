import { SelectTeamTable } from "@/components/teams/select-team-table";
import { Button } from "@proxed/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
	batchPrefetch,
	getQueryClient,
	HydrateClient,
	trpc,
} from "@/trpc/server";

export const metadata: Metadata = {
	title: "Teams | Proxed",
};

export default async function TeamsPage() {
	const queryClient = getQueryClient();
	batchPrefetch([
		trpc.user.me.queryOptions(),
		trpc.team.memberships.queryOptions(),
	]);
	const [user, teamMemberships] = await Promise.all([
		queryClient.fetchQuery(trpc.user.me.queryOptions()),
		queryClient.fetchQuery(trpc.team.memberships.queryOptions()),
	]);

	if (!user) {
		redirect("/login");
	}

	if (!teamMemberships?.length) {
		redirect("/teams/create");
	}

	return (
		<HydrateClient>
			<SelectTeamTable />
			<div className="mt-6 text-center">
				<Link href="/teams/create">
					<Button variant="outline">Create New Team</Button>
				</Link>
			</div>
		</HydrateClient>
	);
}
