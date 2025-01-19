"use client";

import { updateProjectAction } from "@/actions/update-project-action";
import {
	type UpdateProjectFormValues,
	updateProjectSchema,
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
	FormLabel,
	FormMessage,
	FormDescription,
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
import type { Tables } from "@proxed/supabase/types";
import { Textarea } from "@proxed/ui/components/textarea";
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
import Link from "next/link";
import { BrainCircuit, Bot, Sparkles, Blocks } from "lucide-react";
import type { ComponentType } from "react";

interface ProjectEditFormProps {
	project: Tables<"projects">;
	deviceChecks: Tables<"device_checks">[];
}

const PROVIDER_ICONS: Record<
	UpdateProjectFormValues["provider"],
	ComponentType
> = {
	OPENAI: Sparkles,
	ANTHROPIC: Bot,
	GOOGLE: BrainCircuit,
	MISTRAL: Blocks,
};

export function ProjectEditForm({
	project,
	deviceChecks,
}: ProjectEditFormProps) {
	const { toast } = useToast();
	const form = useForm<UpdateProjectFormValues>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: {
			id: project.id,
			name: project.name,
			description: project.description || "",
			bundleId: project.bundle_id,
			deviceCheckId: project.device_check_id || "",
			provider: project.provider,
			providerKeyPartial: project.provider_key_partial,
		},
	});

	const updateProject = useAction(updateProjectAction, {
		onSuccess: () => {
			toast({
				title: "Project updated",
				description: "The project has been updated successfully.",
			});
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: error?.error?.serverError || "Failed to update project",
			});
		},
	});

	const onSubmit = form.handleSubmit((data) => {
		updateProject.execute(data);
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Project Settings</CardTitle>
						<CardDescription>
							Configure your project settings and integrations.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="grid gap-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<div className="text-sm font-medium text-muted-foreground">
									Basic Information
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Project Name</FormLabel>
												<FormControl>
													<Input placeholder="My AI Project" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="bundleId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Bundle ID</FormLabel>
												<FormControl>
													<Input placeholder="com.example.app" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe your project..."
													className="h-20 resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Device Check Integration */}
							<div className="space-y-4">
								<div className="text-sm font-medium text-muted-foreground">
									Device Check Integration
								</div>
								<FormField
									control={form.control}
									name="deviceCheckId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Device Check Configuration</FormLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a device check configuration" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{deviceChecks.length === 0 ? (
														<div className="p-4 text-sm text-center space-y-2">
															<p className="text-muted-foreground">
																No device check configurations found
															</p>
															<Button asChild variant="link" className="p-0">
																<Link href="/settings/team/device-check">
																	Create a Device Check configuration
																</Link>
															</Button>
														</div>
													) : (
														deviceChecks.map((dc) => (
															<SelectItem key={dc.id} value={dc.id}>
																<div className="flex flex-col">
																	<span>{dc.name}</span>
																</div>
															</SelectItem>
														))
													)}
												</SelectContent>
											</Select>
											<FormDescription>
												Select the Device Check configuration to use for this
												project
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* AI Provider Settings */}
							<div className="space-y-4">
								<div className="text-sm font-medium text-muted-foreground">
									AI Provider Settings
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="provider"
										render={({ field }) => (
											<FormItem>
												<FormLabel>AI Provider</FormLabel>
												<Select
													value={field.value}
													onValueChange={field.onChange}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue>
																{field.value && (
																	<div className="flex items-center gap-2">
																		{(() => {
																			const Icon = PROVIDER_ICONS[field.value];
																			return <Icon className="h-4 w-4" />;
																		})()}
																		<span>{field.value}</span>
																	</div>
																)}
															</SelectValue>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{(
															Object.keys(PROVIDER_ICONS) as Array<
																keyof typeof PROVIDER_ICONS
															>
														).map((provider) => {
															const Icon = PROVIDER_ICONS[provider];
															return (
																<SelectItem key={provider} value={provider}>
																	<div className="flex items-center gap-2">
																		<Icon className="h-4 w-4" />
																		<span>{provider}</span>
																	</div>
																</SelectItem>
															);
														})}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="providerKeyPartial"
										render={({ field }) => (
											<FormItem>
												<FormLabel>API Key</FormLabel>
												<FormControl>
													<Input type="password" {...field} />
												</FormControl>
												<FormDescription>
													Your API key is stored securely and partially hidden
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>
					</CardContent>

					<CardFooter className="flex justify-end gap-2">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									type="button"
									disabled={!form.formState.isDirty}
								>
									Reset
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Reset Changes?</AlertDialogTitle>
									<AlertDialogDescription>
										This will reset all changes you've made. This action cannot
										be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={() => form.reset()}>
										Reset Changes
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							type="submit"
							disabled={
								updateProject.status === "executing" || !form.formState.isDirty
							}
						>
							{updateProject.status === "executing" ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving Changes...
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
