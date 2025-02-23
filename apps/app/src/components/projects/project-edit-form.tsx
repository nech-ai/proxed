"use client";

import type { ReactNode } from "react";
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

type Provider = "OPENAI" | "ANTHROPIC";

interface ModelOption {
	value: string;
	label: string;
}

const MODEL_OPTIONS: Record<Provider, ModelOption[]> = {
	OPENAI: [
		{ value: "gpt-4o", label: "GPT-4o" },
		{ value: "gpt-4o-mini", label: "GPT-4o Mini" },
	],
	ANTHROPIC: [{ value: "claude-3-sonnet", label: "Claude 3 Sonnet" }],
};

interface SectionProps {
	title: string;
	children: ReactNode;
}

function Section({ title, children }: SectionProps) {
	return (
		<div>
			<div className="text-lg font-semibold border-b pb-2 text-foreground">
				{title}
			</div>
			<div className="mt-4">{children}</div>
		</div>
	);
}

interface EmptyStateProps {
	message: string;
	linkText: string;
	linkHref: string;
}

function EmptyState({ message, linkText, linkHref }: EmptyStateProps) {
	return (
		<div className="p-4 text-sm text-center space-y-2">
			<p className="text-muted-foreground">{message}</p>
			<Button asChild variant="link" className="p-0">
				<Link href={linkHref}>{linkText}</Link>
			</Button>
		</div>
	);
}

interface ConfirmationDialogProps {
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
}

function ConfirmationDialog({
	isOpen,
	onCancel,
	onConfirm,
	title,
	description,
}: ConfirmationDialogProps) {
	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{title}</AlertDialogTitle>
				<AlertDialogDescription>{description}</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
				<AlertDialogAction onClick={onConfirm}>
					Confirm Change
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}

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
			deviceCheckId: project.device_check_id || "none",
			keyId: project.key_id || "none",
			systemPrompt: project.system_prompt || "",
			defaultUserPrompt: project.default_user_prompt || "",
			model: project.model || "none",
		},
	});

	const [pendingKeyChange, setPendingKeyChange] = useState<string | null>(null);
	const [pendingDeviceCheckChange, setPendingDeviceCheckChange] = useState<
		string | null
	>(null);

	const handleKeyChange = (value: string) => {
		if (form.getValues("keyId") === "none") {
			form.setValue("keyId", value, { shouldDirty: true });
			if (value === "none") {
				form.setValue("model", "none", { shouldDirty: true });
			}
			return;
		}

		if (value === "none") {
			form.setValue("model", "none");
		}
		setPendingKeyChange(value);
	};

	const handleDeviceCheckChange = (value: string) => {
		if (form.getValues("deviceCheckId") === "none") {
			form.setValue("deviceCheckId", value, { shouldDirty: true });
			return;
		}
		setPendingDeviceCheckChange(value);
	};

	const confirmChange = (type: "key" | "deviceCheck") => {
		if (type === "key" && pendingKeyChange !== null) {
			form.setValue("keyId", pendingKeyChange, { shouldDirty: true });
			if (pendingKeyChange === "none") {
				form.setValue("model", "none", { shouldDirty: true });
			}
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

	const selectedKey = keys.find((k) => k.id === form.watch("keyId"));
	const selectedProvider = selectedKey?.provider as Provider | undefined;

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
							<Section title="Basic Information">
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
							</Section>

							<Section title="Device Check Integration">
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="deviceCheckId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Device Check Configuration</FormLabel>
												<AlertDialog open={!!pendingDeviceCheckChange}>
													<AlertDialogTrigger asChild>
														<Select
															value={field.value}
															onValueChange={handleDeviceCheckChange}
															disabled={deviceChecks.length === 0}
														>
															<FormControl>
																<SelectTrigger className="w-full rounded-md border border-input px-3 py-2 bg-card text-foreground focus:ring focus:ring-ring">
																	<SelectValue placeholder="Select a device check configuration" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{deviceChecks.length === 0 ? (
																	<EmptyState
																		message="No device check configurations found"
																		linkText="Create a Device Check configuration"
																		linkHref="/settings/team/device-check"
																	/>
																) : (
																	<>
																		<SelectItem value="none">None</SelectItem>
																		{deviceChecks.map((dc) => (
																			<SelectItem key={dc.id} value={dc.id}>
																				<div className="flex flex-col">
																					<span>{dc.name}</span>
																				</div>
																			</SelectItem>
																		))}
																	</>
																)}
															</SelectContent>
														</Select>
													</AlertDialogTrigger>
													{pendingDeviceCheckChange && (
														<ConfirmationDialog
															isOpen={!!pendingDeviceCheckChange}
															onCancel={() => setPendingDeviceCheckChange(null)}
															onConfirm={() => confirmChange("deviceCheck")}
															title="Warning: Configuration Change"
															description="Changing the Device Check configuration will affect all production apps using this project. This change may disrupt service for existing users. Are you sure you want to proceed?"
														/>
													)}
												</AlertDialog>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</Section>

							<Section title="AI Provider Settings">
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="keyId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>AI Provider</FormLabel>
												<AlertDialog open={!!pendingKeyChange}>
													<AlertDialogTrigger asChild>
														<Select
															value={field.value}
															onValueChange={handleKeyChange}
															disabled={keys.length === 0}
														>
															<FormControl>
																<SelectTrigger className="w-full rounded-md border border-input px-3 py-2 bg-card text-foreground focus:ring focus:ring-ring">
																	<SelectValue placeholder="Select a provider">
																		{field.value && field.value !== "none" && (
																			<div className="flex items-center gap-2">
																				<span>
																					{
																						keys.find(
																							(k) => k.id === field.value,
																						)?.display_name
																					}{" "}
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
																{keys.length === 0 ? (
																	<EmptyState
																		message="No API keys found"
																		linkText="Create an API key"
																		linkHref="/settings/team/keys"
																	/>
																) : (
																	<>
																		<SelectItem value="none">None</SelectItem>
																		{keys
																			.filter((key) => key.id)
																			.map((key) => (
																				<SelectItem key={key.id} value={key.id}>
																					<div className="flex items-center gap-2">
																						<span>
																							{key.display_name} ({key.provider}
																							)
																						</span>
																					</div>
																				</SelectItem>
																			))}
																	</>
																)}
															</SelectContent>
														</Select>
													</AlertDialogTrigger>
													{pendingKeyChange && (
														<ConfirmationDialog
															isOpen={!!pendingKeyChange}
															onCancel={() => setPendingKeyChange(null)}
															onConfirm={() => confirmChange("key")}
															title="Warning: Credentials Change"
															description="Changing the AI Provider will affect all production apps using this project. This change may disrupt service for existing users. Are you sure you want to proceed?"
														/>
													)}
												</AlertDialog>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</Section>

							<Section title="AI Configuration">
								<div className="grid gap-4 sm:grid-cols-2">
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
														{!selectedProvider ? (
															<EmptyState
																message="Select a provider first"
																linkText=""
																linkHref=""
															/>
														) : (
															<>
																<SelectItem value="none">None</SelectItem>
																{MODEL_OPTIONS[selectedProvider].map(
																	(option) => (
																		<SelectItem
																			key={option.value}
																			value={option.value}
																		>
																			{option.label}
																		</SelectItem>
																	),
																)}
															</>
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
							</Section>
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
							<ConfirmationDialog
								isOpen={true}
								onCancel={() => {}}
								onConfirm={() => form.reset()}
								title="Reset Changes?"
								description="This will reset all changes you've made. This action cannot be undone."
							/>
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
