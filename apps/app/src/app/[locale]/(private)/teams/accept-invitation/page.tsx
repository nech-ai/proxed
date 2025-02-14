import { AcceptInvitationForm } from "@/components/teams/accept-invitation-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Accept Invitation",
};

export default async function TeamsAcceptInvitationPage() {
	return <AcceptInvitationForm />;
}
