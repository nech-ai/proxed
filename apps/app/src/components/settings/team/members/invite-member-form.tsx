"use client";

import { inviteTeamMemberAction } from "@/actions/invite-team-member-action";
import {
	type InviteTeamMemberFormValues,
	inviteTeamMemberSchema,
} from "@/actions/schema";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

interface InviteMemberFormProps {
	onSuccess?: () => void;
	revalidatePath?: string;
}

export function InviteMemberForm({
	onSuccess,
	revalidatePath,
}: InviteMemberFormProps) {
	const { toast } = useToast();
	const form = useForm<InviteTeamMemberFormValues>({
		resolver: zodResolver(inviteTeamMemberSchema),
		defaultValues: {
			email: "",
			role: "MEMBER",
			revalidatePath,
		},
	});

	const inviteMember = useAction(inviteTeamMemberAction, {
		onSuccess: () => {
			form.reset();
			toast({
				title: "Invitation sent",
				description: "The team member has been invited successfully.",
			});
			onSuccess?.();
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: error?.error?.serverError || "Failed to send invitation",
			});
		},
	});

	const onSubmit = form.handleSubmit((data) => {
		inviteMember.execute(data);
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Invite Team Member</CardTitle>
						<CardDescription>
							Send an invitation to add a new member to your team.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="flex items-center gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormControl>
											<Input
												placeholder="Email address"
												type="email"
												autoComplete="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem className="w-[180px]">
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="OWNER">Owner</SelectItem>
												<SelectItem value="MEMBER">Member</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={
									inviteMember.status === "executing" || !form.formState.isDirty
								}
							>
								{inviteMember.status === "executing" ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending...
									</>
								) : (
									"Send invitation"
								)}
							</Button>
						</div>
					</CardContent>

					<CardFooter>
						<div className="text-muted-foreground text-sm">
							The invitation will be sent via email
						</div>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
