"use client";

import { Button } from "@proxed/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
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
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, MoreVerticalIcon, Trash2 } from "lucide-react";

export function VaultItemActions({
	id,
	path,
}: {
	id: string;
	path: string;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const signedUrlMutation = useMutation(
		trpc.vault.signedUrl.mutationOptions(),
	);

	const deleteMutation = useMutation(
		trpc.vault.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.vault.list.queryKey(),
				});
			},
		}),
	);

	const handleOpen = async () => {
		try {
			const targetUrl = (
				await signedUrlMutation.mutateAsync({
					path,
				})
			).url;

			if (targetUrl) {
				window.open(targetUrl, "_blank", "noopener,noreferrer");
			}
		} catch {}
	};

	const handleDownload = async () => {
		try {
			const result = await signedUrlMutation.mutateAsync({
				path,
				download: true,
			});

			if (result.url) {
				const link = document.createElement("a");
				link.href = result.url;
				link.download = "";
				link.click();
			}
		} catch {}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="ghost">
					<MoreVerticalIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={handleOpen}>
					<ExternalLink className="mr-2 size-4" />
					Open
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDownload}>
					<Download className="mr-2 size-4" />
					Download
				</DropdownMenuItem>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							onSelect={(event) => event.preventDefault()}
						>
							<Trash2 className="mr-2 size-4 text-destructive" />
							<span className="text-destructive">Delete</span>
						</DropdownMenuItem>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this file?</AlertDialogTitle>
							<AlertDialogDescription>
								This permanently removes the file from your vault.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								onClick={() => deleteMutation.mutate({ id })}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
