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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMembershipQuery } from "@/hooks/use-membership";
import { useTeamMutation, useTeamQuery } from "@/hooks/use-team";

export function DisplayTeamName() {
	const { toast } = useToast();
	const router = useRouter();
	const { data: team } = useTeamQuery();
	const { role } = useMembershipQuery();
	const teamName = team?.name ?? "";

	const updateTeam = useTeamMutation();

	const form = useForm<UpdateTeamFormValues>({
		resolver: zodResolver(updateTeamSchema),
		defaultValues: {
			name: "",
		},
	});

	useEffect(() => {
		form.reset({ name: teamName });
	}, [teamName, form]);

	const onSubmit = form.handleSubmit((data) => {
		updateTeam.mutate(
			{
				name: data?.name,
			},
			{
				onSuccess: () => {
					toast({
						title: "Team name updated",
						description: "Your team name has been updated successfully.",
					});
					router.refresh();
				},
				onError: (error) => {
					toast({
						variant: "destructive",
						title: "Error",
						description: error?.message || "Failed to update team name",
					});
				},
			},
		);
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
											spellCheck={false}
											maxLength={32}
											disabled={role !== "OWNER"}
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
