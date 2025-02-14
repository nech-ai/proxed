"use client";

import { acceptInvitationAction } from "@/actions/accept-invitation-action";
import { Button } from "@proxed/ui/components/button";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { TeamCard } from "./team-card";

export function AcceptInvitationForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const code = searchParams.get("code");

	const acceptInvitation = useAction(acceptInvitationAction, {
		onSuccess: () => {
			router.push("/");
		},
	});

	function onAccept() {
		if (!code) return;
		acceptInvitation.execute({ invitationId: code, redirectTo: "/" });
	}

	function onReject() {
		router.push("/");
	}

	return (
		<TeamCard
			title="Team Invitation"
			description="You have been invited to join a team"
		>
			<Button
				className="w-full"
				onClick={onAccept}
				disabled={acceptInvitation.status === "executing"}
			>
				{acceptInvitation.status === "executing" ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					"Accept Invitation"
				)}
			</Button>
			<hr className="my-4" />
			<Button variant="outline" className="w-full" onClick={onReject}>
				Back to Home
			</Button>
		</TeamCard>
	);
}
