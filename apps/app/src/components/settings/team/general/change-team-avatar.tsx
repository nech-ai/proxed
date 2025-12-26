"use client";

import { type UpdateTeamFormValues, updateTeamSchema } from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { Form, FormMessage } from "@proxed/ui/components/form";
import { toast } from "@proxed/ui/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { TeamAvatarUpload } from "./team-avatar-upload";
import { useRouter } from "next/navigation";
import { useMembershipQuery } from "@/hooks/use-membership";
import { useTeamMutation, useTeamQuery } from "@/hooks/use-team";

export function ChangeTeamAvatar() {
	const router = useRouter();
	const { data: team } = useTeamQuery();
	const { role } = useMembershipQuery();

	const form = useForm<UpdateTeamFormValues>({
		resolver: zodResolver(updateTeamSchema),
		defaultValues: {
			avatarUrl: "",
		},
	});

	useEffect(() => {
		if (!team) return;
		form.reset({ avatarUrl: team.avatarUrl ?? "" });
	}, [team, form]);

	const updateTeam = useTeamMutation();

	const onSubmit = form.handleSubmit((data) => {
		updateTeam.mutate(
			{
				avatarUrl: data?.avatarUrl,
			},
			{
				onSuccess: () => {
					router.refresh();
				},
			},
		);
		form.reset();
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Avatar</CardTitle>
						<CardDescription>Change your avatar.</CardDescription>
					</CardHeader>

					<CardContent>
						{team && (
							<TeamAvatarUpload
								team={team}
								onSuccess={(avatarUrl) => {
									toast({
										variant: "default",
										description: "Your avatar has been updated.",
									});
									form.setValue("avatarUrl", avatarUrl, {
										shouldDirty: true,
									});
								}}
								onError={(error) => {
									toast({
										variant: "destructive",
										title: "Avatar not updated",
										description: error,
									});
								}}
							/>
						)}
						<FormMessage />
					</CardContent>

					<CardFooter className="flex justify-between">
						<div>This is your team avatar.</div>
						<Button
							type="submit"
							disabled={
								updateTeam.isPending ||
								!form.formState.isDirty ||
								role !== "OWNER"
							}
						>
							{updateTeam.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Save"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
