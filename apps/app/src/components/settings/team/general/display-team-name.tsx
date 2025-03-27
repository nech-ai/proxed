"use client";

import { type UpdateTeamFormValues, updateTeamSchema } from "@/actions/schema";
import { updateTeamAction } from "@/actions/update-team-action";
import { useTeamContext } from "@/store/team/hook";
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

type Props = {
	teamName: string;
};

export function DisplayTeamName({ teamName }: Props) {
	const { toast } = useToast();
	const { teamMembership } = useTeamContext((state) => state.data);
	const action = useAction(updateTeamAction, {
		onSuccess: () => {
			toast({
				title: "Team name updated",
				description: "Your team name has been updated successfully.",
			});
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: error?.error?.serverError || "Failed to update team name",
			});
		},
	});
	const form = useForm<UpdateTeamFormValues>({
		resolver: zodResolver(updateTeamSchema),
		defaultValues: {
			name: teamName,
		},
	});

	const onSubmit = form.handleSubmit((data) => {
		action.execute({
			name: data?.name,
		});
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Team Name</CardTitle>
						<CardDescription>
							Please enter your team name, or a display name you are comfortable
							with.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											className="max-w-[300px]"
											autoComplete="off"
											autoCapitalize="none"
											autoCorrect="off"
											spellCheck="false"
											maxLength={32}
											disabled={teamMembership?.role !== "OWNER"}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>

					<CardFooter className="flex justify-between">
						<div>Please use 32 characters at maximum.</div>
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
