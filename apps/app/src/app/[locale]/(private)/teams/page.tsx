import { SelectTeamTable } from "@/components/teams/select-team-table";
import { getUser } from "@proxed/supabase/cached-queries";
import { getTeamMembershipsByUserIdQuery } from "@proxed/supabase/queries";
import { createClient } from "@proxed/supabase/server";
import { Button } from "@proxed/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Teams | Proxed.AI",
};

export default async function TeamsPage() {
	const supabase = await createClient();
	const user = await getUser();

	const teamsMemberships = await getTeamMembershipsByUserIdQuery(
		supabase,
		user?.data?.id ?? "",
	);
	if (!teamsMemberships?.data?.length) {
		redirect("/teams/create");
	}

	return (
		<>
			<SelectTeamTable
				activeTeamId={user?.data?.team_id}
				data={teamsMemberships.data}
			/>
			<div className="mt-6 text-center">
				<Link href="/teams/create">
					<Button variant="outline">Create New Team</Button>
				</Link>
			</div>
		</>
	);
}
