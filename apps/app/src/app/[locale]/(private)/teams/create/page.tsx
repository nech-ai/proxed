import { CreateTeamForm } from "@/components/teams/create-team-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create Team | Proxed",
};

export default async function TeamsCreatePage() {
	return <CreateTeamForm />;
}
