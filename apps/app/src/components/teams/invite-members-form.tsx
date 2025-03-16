"use client";

import { inviteTeamMembersAction } from "@/actions/invite-team-members-action";
import {
	type InviteTeamMembersFormValues,
	inviteTeamMembersSchema,
} from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
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
import { PlusCircle, Loader2, Mail, X, ChevronRight } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { TeamCard } from "./team-card";
import { cn } from "@proxed/ui/utils";

export function InviteMembersForm() {
	const { toast } = useToast();

	const inviteMembers = useAction(inviteTeamMembersAction, {
		onError: () => {
			toast({
				duration: 3500,
				variant: "destructive",
				title: "Something went wrong please try again.",
			});
		},
		onSuccess: () => {
			toast({
				duration: 3500,
				title: "Invitations sent successfully!",
				description: "Your team members will receive an email shortly.",
			});
		},
	});

	const form = useForm<InviteTeamMembersFormValues>({
		resolver: zodResolver(inviteTeamMembersSchema),
		defaultValues: {
			invites: [
				{
					email: "",
					role: "MEMBER",
				},
			],
		},
		mode: "onChange",
	});

	function onSubmit(values: InviteTeamMembersFormValues) {
		inviteMembers.execute({
			invites: values.invites.filter((invite) => invite.email !== undefined),
			redirectTo: "/teams/device-check",
		});
	}

	const { fields, append, remove } = useFieldArray({
		name: "invites",
		control: form.control,
	});

	return (
		<TeamCard
			title="Invite Team Members"
			description="Build your team by inviting members to collaborate"
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-6">
						{fields.map((field, index) => {
							// Get errors for this field group
							const emailError = form.formState.errors.invites?.[index]?.email;
							const roleError = form.formState.errors.invites?.[index]?.role;

							return (
								<div key={field.id} className="space-y-1">
									<div className="flex items-center gap-3">
										{/* Email field */}
										<div className="relative flex-1">
											<FormField
												control={form.control}
												name={`invites.${index}.email`}
												render={({ field }) => (
													<>
														<Input
															className={cn(
																"pl-9 h-10",
																emailError &&
																	"border-destructive focus-visible:ring-destructive",
															)}
															placeholder="colleague@company.com"
															type="email"
															autoComplete="off"
															autoCapitalize="none"
															autoCorrect="off"
															spellCheck="false"
															{...field}
														/>
														<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
													</>
												)}
											/>
										</div>

										{/* Role field */}
										<div>
											<FormField
												control={form.control}
												name={`invites.${index}.role`}
												render={({ field }) => (
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger
																className={cn(
																	"min-w-[130px] h-10",
																	roleError &&
																		"border-destructive focus-visible:ring-destructive",
																)}
															>
																<SelectValue placeholder="Select role" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="OWNER">Owner</SelectItem>
															<SelectItem value="MEMBER">Member</SelectItem>
														</SelectContent>
													</Select>
												)}
											/>
										</div>

										{/* Remove button */}
										{fields.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 transition-opacity"
												onClick={() => remove(index)}
											>
												<X className="h-4 w-4" />
												<span className="sr-only">Remove</span>
											</Button>
										)}
									</div>

									{/* Error messages displayed below the inputs */}
									<div className="flex">
										<div className="flex-1">
											{emailError && (
												<p className="text-xs text-destructive">
													{emailError.message}
												</p>
											)}
										</div>
										<div className="min-w-[130px]">
											{roleError && (
												<p className="text-xs text-destructive">
													{roleError.message}
												</p>
											)}
										</div>
										{fields.length > 1 && <div className="w-8" />}
									</div>
								</div>
							);
						})}
					</div>

					<Button
						variant="outline"
						type="button"
						size="sm"
						className="mt-2 flex items-center gap-1"
						onClick={() => append({ email: undefined, role: "MEMBER" })}
					>
						<PlusCircle className="h-4 w-4" />
						<span>Add another member</span>
					</Button>

					<div className="pt-4 border-t mt-4">
						<div className="flex items-center justify-between">
							<Link href="/teams/device-check">
								<Button
									variant="ghost"
									type="button"
									className="text-muted-foreground hover:text-foreground"
								>
									Skip for now
								</Button>
							</Link>

							<Button
								type="submit"
								disabled={inviteMembers.status === "executing"}
								className="px-6"
							>
								{inviteMembers.status === "executing" ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Sending...
									</>
								) : (
									<>
										Send Invitations
										<ChevronRight className="h-4 w-4 ml-2" />
									</>
								)}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</TeamCard>
	);
}
