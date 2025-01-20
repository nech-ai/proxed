"use client";

import { acceptInvitationAction } from "@/actions/accept-invitation-action";
import { Button } from "@proxed/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";

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
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Team Invitation</CardTitle>
				<CardDescription>You have been invited to join a team</CardDescription>
			</CardHeader>
			<CardContent>
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
			</CardContent>
		</Card>
	);
}
