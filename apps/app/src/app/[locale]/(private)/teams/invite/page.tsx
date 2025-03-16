import { InviteMembersForm } from "@/components/teams/invite-members-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Invite Users | Proxed",
};

export default async function Page() {
	return <InviteMembersForm />;
}
