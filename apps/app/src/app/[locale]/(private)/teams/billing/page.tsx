import { TeamBillingForm } from "@/components/teams/team-billing-form";
import { getUser } from "@proxed/supabase/cached-queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
export const metadata: Metadata = {
	title: "Choose a Plan | Proxed",
};

export default async function Page() {
	const user = await getUser();
	const teamId = user?.data?.team_id;
	if (!teamId) {
		return notFound();
	}
	return <TeamBillingForm teamId={teamId} />;
}
