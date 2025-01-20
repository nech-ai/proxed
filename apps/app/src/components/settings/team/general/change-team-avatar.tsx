"use client";

import { type UpdateTeamFormValues, updateTeamSchema } from "@/actions/schema";
import { updateTeamAction } from "@/actions/update-team-action";
import { useTeam } from "@/hooks/use-team";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Team } from "@proxed/supabase/types";
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
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { TeamAvatarUpload } from "./team-avatar-upload";

type Props = {
	team: Team;
};

export function ChangeTeamAvatar({ team }: Props) {
	const action = useAction(updateTeamAction);
	const { teamMembership } = useTeam();

	const form = useForm<UpdateTeamFormValues>({
		resolver: zodResolver(updateTeamSchema),
		defaultValues: {
			avatar_url: team.avatar_url ?? "",
		},
	});

	const onSubmit = form.handleSubmit((data) => {
		action.execute({
			avatar_url: data?.avatar_url,
			revalidatePath: "/settings/team/general",
		});
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
						<TeamAvatarUpload
							team={team}
							onSuccess={(avatar_url) => {
								toast({
									variant: "default",
									description: "Your avatar has been updated.",
								});
								form.setValue("avatar_url", avatar_url, {
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
						<FormMessage />
					</CardContent>

					<CardFooter className="flex justify-between">
						<div>This is your team avatar.</div>
						<Button
							type="submit"
							disabled={
								action.status === "executing" ||
								!form.formState.isDirty ||
								teamMembership?.role !== "OWNER"
							}
						>
							{action.status === "executing" ? (
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
