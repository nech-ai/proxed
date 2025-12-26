"use client";

import { Button } from "@proxed/ui/components/button";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { TeamCard } from "./team-card";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export function AcceptInvitationForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const trpc = useTRPC();

	const acceptInvitation = useMutation(
		trpc.team.acceptInvitation.mutationOptions({
			onSuccess: () => {
				router.push("/");
				router.refresh();
			},
		}),
	);

	function onAccept() {
		if (!code) return;
		acceptInvitation.mutate({ invitationId: code });
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
				disabled={acceptInvitation.isPending}
			>
				{acceptInvitation.isPending ? (
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
