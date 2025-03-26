import { TeamBillingForm } from "@/components/teams/team-billing-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Choose a Plan | Proxed",
};

export default async function Page() {
	return <TeamBillingForm />;
}
