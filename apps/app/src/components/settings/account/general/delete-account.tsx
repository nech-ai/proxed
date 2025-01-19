"use client";

import { deleteUserAction } from "@/actions/delete-user-action";
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
import { useTransition } from "react";

export function DeleteAccount() {
	const [isPending, startTransition] = useTransition();

	return (
		<Card className="border-destructive">
			<CardHeader>
				<CardTitle>Delete account</CardTitle>
				<CardDescription>
					Permanently remove your Personal Account and all of its contents from
					the platform. This action is not reversible, so please continue with
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
						>
							Delete
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your
								account and remove your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => startTransition(() => deleteUserAction())}
							>
								{isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Continue"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardFooter>
		</Card>
	);
}
