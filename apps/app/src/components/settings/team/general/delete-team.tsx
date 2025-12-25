"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@proxed/ui/components/alert-dialog";
import { Button } from "@proxed/ui/components/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useMembershipQuery } from "@/hooks/use-membership";
import { useUserQuery } from "@/hooks/use-user";

export function DeleteTeam() {
	const router = useRouter();
	const trpc = useTRPC();
	const { data: user } = useUserQuery();
	const { role } = useMembershipQuery();
	const teamId = user?.teamId ?? user?.team?.id ?? null;

	const deleteTeam = useMutation(
		trpc.team.delete.mutationOptions({
			onSuccess: () => router.push("/teams"),
		}),
	);

	return (
		<Card className="border-destructive">
			<CardHeader>
				<CardTitle>Delete team</CardTitle>
				<CardDescription>
					Permanently remove your Team and all of its contents from the
					platform. This action is not reversible — please continue with
					caution.
				</CardDescription>
			</CardHeader>
			<CardFooter className="flex justify-between">
				<div />

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="destructive"
							className="text-muted hover:bg-destructive"
							disabled={role !== "OWNER" || !teamId}
						>
							Delete
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your
								team and remove your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									if (teamId) {
										deleteTeam.mutate({ teamId });
									}
								}}
							>
								{deleteTeam.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Confirm"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardFooter>
		</Card>
	);
}
