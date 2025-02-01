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
import { useState } from "react";

interface ProjectEditFormProps {
	project: Tables<"projects">;
	deviceChecks: Tables<"device_checks">[];
	keys: Tables<"provider_keys">[];
}

export function ProjectEditForm({
	project,
	deviceChecks,
	keys,
}: ProjectEditFormProps) {
	const { toast } = useToast();
	const form = useForm<UpdateProjectFormValues>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: {
			id: project.id,
			name: project.name,
			description: project.description || "",
			bundleId: project.bundle_id,
			deviceCheckId: project.device_check_id,
			keyId: project.key_id,
			systemPrompt: project.system_prompt || "",
			defaultUserPrompt: project.default_user_prompt || "",
			model: project.model || "",
		},
	});

	// Add state for tracking pending changes
	const [pendingKeyChange, setPendingKeyChange] = useState<string | null>(null);
	const [pendingDeviceCheckChange, setPendingDeviceCheckChange] = useState<
		string | null
	>(null);

	const handleKeyChange = (value: string) => {
		setPendingKeyChange(value);
	};

	const handleDeviceCheckChange = (value: string) => {
		setPendingDeviceCheckChange(value);
	};

	const confirmChange = (type: "key" | "deviceCheck") => {
		if (type === "key" && pendingKeyChange !== null) {
			form.setValue("keyId", pendingKeyChange, { shouldDirty: true });
			setPendingKeyChange(null);
		} else if (type === "deviceCheck" && pendingDeviceCheckChange !== null) {
			form.setValue("deviceCheckId", pendingDeviceCheckChange, {
				shouldDirty: true,
			});
			setPendingDeviceCheckChange(null);
		}
	};

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

	// Get selected key's provider
	const selectedKey = keys.find((k) => k.id === form.watch("keyId"));
	const selectedProvider = selectedKey?.provider;

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card className="bg-card shadow-lg rounded-lg">
					<CardHeader>
						<CardTitle>Project Settings</CardTitle>
						<CardDescription>
							Configure your project settings and integrations.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="space-y-8">
							{/* Basic Information */}
							<div>
								<div className="text-lg font-semibold border-b pb-2 text-foreground">
									Basic Information
								</div>
								<div className="grid gap-4 sm:grid-cols-2 mt-4">
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
								<div className="mt-4">
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
							</div>

							{/* Device Check Integration */}
							<div>
								<div className="text-lg font-semibold border-b pb-2 text-foreground">
									Device Check Integration
								</div>
								<div className="grid gap-4 sm:grid-cols-2 mt-4">
									<FormField
										control={form.control}
										name="deviceCheckId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Device Check Configuration</FormLabel>
												<AlertDialog open={!!pendingDeviceCheckChange}>
													<AlertDialogTrigger asChild>
														<Select
															value={field.value || ""}
															onValueChange={handleDeviceCheckChange}
														>
															<FormControl>
																<SelectTrigger className="w-full rounded-md border border-input px-3 py-2 bg-card text-foreground focus:ring focus:ring-ring">
																	<SelectValue placeholder="Select a device check configuration" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{deviceChecks.length === 0 ? (
																	<div className="p-4 text-sm text-center space-y-2">
																		<p className="text-muted-foreground">
																			No device check configurations found
																		</p>
																		<Button
																			asChild
																			variant="link"
																			className="p-0"
																		>
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
													</AlertDialogTrigger>
													{pendingDeviceCheckChange && (
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>
																	Warning: Configuration Change
																</AlertDialogTitle>
																<AlertDialogDescription>
																	Changing the Device Check configuration will
																	affect all production apps using this project.
																	This change may disrupt service for existing
																	users. Are you sure you want to proceed?
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel
																	onClick={() =>
																		setPendingDeviceCheckChange(null)
																	}
																>
																	Cancel
																</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => confirmChange("deviceCheck")}
																>
																	Confirm Change
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													)}
												</AlertDialog>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* AI Provider Settings */}
							<div>
								<div className="text-lg font-semibold border-b pb-2 text-foreground">
									AI Provider Settings
								</div>
								<div className="grid gap-4 sm:grid-cols-2 mt-4">
									<FormField
										control={form.control}
										name="keyId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>AI Provider</FormLabel>
												<AlertDialog open={!!pendingKeyChange}>
													<AlertDialogTrigger asChild>
														<Select
															value={field.value || ""}
															onValueChange={handleKeyChange}
														>
															<FormControl>
																<SelectTrigger className="w-full rounded-md border border-input px-3 py-2 bg-card text-foreground focus:ring focus:ring-ring">
																	<SelectValue placeholder="Select a provider">
																		{field.value && (
																			<div className="flex items-center gap-2">
																				<span>
																					{
																						keys.find(
																							(k) => k.id === field.value,
																						)?.display_name
																					}
																					(
																					{
																						keys.find(
																							(k) => k.id === field.value,
																						)?.provider
																					}
																					)
																				</span>
																			</div>
																		)}
																	</SelectValue>
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{keys.map((key) => (
																	<SelectItem key={key.id} value={key.id}>
																		<div className="flex items-center gap-2">
																			<span>
																				{key.display_name} ({key.provider})
																			</span>
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</AlertDialogTrigger>
													{pendingKeyChange && (
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>
																	Warning: Credentials Change
																</AlertDialogTitle>
																<AlertDialogDescription>
																	Changing the AI Provider will affect all
																	production apps using this project. This
																	change may disrupt service for existing users.
																	Are you sure you want to proceed?
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel
																	onClick={() => setPendingKeyChange(null)}
																>
																	Cancel
																</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => confirmChange("key")}
																>
																	Confirm Change
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													)}
												</AlertDialog>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* AI Configuration */}
							<div>
								<div className="text-lg font-semibold border-b pb-2 text-foreground">
									AI Configuration
								</div>
								<div className="grid gap-4 sm:grid-cols-2 mt-4">
									<FormField
										control={form.control}
										name="model"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Model</FormLabel>
												<Select
													value={field.value}
													onValueChange={field.onChange}
													disabled={!selectedProvider}
												>
													<FormControl>
														<SelectTrigger className="w-full rounded-md border border-input px-3 py-2 bg-card text-foreground focus:ring focus:ring-ring">
															<SelectValue placeholder="Select a model" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{selectedProvider === "OPENAI" ? (
															<>
																<SelectItem value="gpt-4o">GPT-4o</SelectItem>
																<SelectItem value="gpt-4o-mini">
																	GPT-4o Mini
																</SelectItem>
															</>
														) : selectedProvider === "ANTHROPIC" ? (
															<SelectItem value="claude-3-sonnet">
																Claude 3 Sonnet
															</SelectItem>
														) : (
															<SelectItem value="" disabled>
																Select a provider first
															</SelectItem>
														)}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid gap-4 mt-4">
									<FormField
										control={form.control}
										name="systemPrompt"
										render={({ field }) => (
											<FormItem>
												<FormLabel>System Prompt</FormLabel>
												<FormControl>
													<Textarea
														placeholder="You are a helpful AI assistant..."
														className="h-32 resize-none"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Define the AI's behavior and context
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="defaultUserPrompt"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Default User Prompt</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Enter a default prompt..."
														className="h-20 resize-none"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Optional starting prompt for new conversations
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
