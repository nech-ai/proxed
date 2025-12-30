"use client";

import type { ReactNode } from "react";
import {
	type UpdateProjectFormValues,
	updateProjectSchema,
} from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
import { ModelBadge } from "@proxed/ui/components/model-badge";
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
import { useForm } from "react-hook-form";
import { Textarea } from "@proxed/ui/components/textarea";
import { Switch } from "@proxed/ui/components/switch";
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
import { useEffect, useState } from "react";
import type { Provider } from "@proxed/utils/lib/providers";
import { getModelOptionsWithPricing } from "@proxed/utils/lib/pricing";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
	onCancel: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
}

function ConfirmationDialog({
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
	projectId: string;
}

export function ProjectEditForm({ projectId }: ProjectEditFormProps) {
	const { toast } = useToast();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: project } = useQuery(
		trpc.projects.byId.queryOptions({ id: projectId }),
	);
	const { data: deviceChecksResponse } = useQuery(
		trpc.deviceChecks.list.queryOptions(),
	);
	const { data: keys = [] } = useQuery(trpc.providerKeys.list.queryOptions());
	const deviceChecks = deviceChecksResponse?.data ?? [];

	const form = useForm<UpdateProjectFormValues>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: {
			id: projectId,
			name: "",
			description: "",
			bundleId: "",
			deviceCheckId: "none",
			keyId: "none",
			systemPrompt: "",
			defaultUserPrompt: "",
			model: "none",
			notificationThreshold: undefined,
			notificationIntervalSeconds: undefined,
			saveImagesToVault: false,
		},
	});

	useEffect(() => {
		if (!project) return;
		form.reset({
			id: project.id,
			name: project.name,
			description: project.description || "",
			bundleId: project.bundleId,
			deviceCheckId: project.deviceCheckId || "none",
			keyId: project.keyId || "none",
			systemPrompt: project.systemPrompt || "",
			defaultUserPrompt: project.defaultUserPrompt || "",
			model: project.model || "none",
			notificationThreshold: project.notificationThreshold ?? undefined,
			notificationIntervalSeconds:
				project.notificationIntervalSeconds ?? undefined,
			saveImagesToVault: project.saveImagesToVault ?? false,
		});
	}, [project, form]);

	const [pendingKeyChange, setPendingKeyChange] = useState<string | null>(null);
	const [pendingDeviceCheckChange, setPendingDeviceCheckChange] = useState<
		string | null
	>(null);

	// Watch the interval value to conditionally disable the threshold input
	const watchedInterval = form.watch("notificationIntervalSeconds");

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

	const updateProject = useMutation(
		trpc.projects.update.mutationOptions({
			onSuccess: () => {
				toast({
					title: "Project updated",
					description: "The project has been updated successfully.",
				});
				queryClient.invalidateQueries({
					queryKey: trpc.projects.byId.queryKey({ id: projectId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.projects.list.queryKey({}),
				});
			},
			onError: (error) => {
				toast({
					variant: "destructive",
					title: "Error",
					description: error?.message || "Failed to update project",
				});
			},
		}),
	);

	const onSubmit = form.handleSubmit((data) => {
		updateProject.mutate({
			...data,
			deviceCheckId: data.deviceCheckId === "none" ? null : data.deviceCheckId,
			keyId: data.keyId === "none" ? null : data.keyId,
		});
	});

	const selectedKey = keys.find((k) => k.id === form.watch("keyId"));
	const selectedProvider = selectedKey?.provider as Provider | undefined;
	const modelOptions = selectedProvider
		? getModelOptionsWithPricing(selectedProvider)
		: [];

	if (!project) {
		return null;
	}

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
																						)?.displayName
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
																							{key.displayName} ({key.provider})
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
																{modelOptions.map((option) => (
																	<SelectItem
																		key={option.value}
																		value={option.value}
																	>
																		<div className="flex items-center justify-between w-full gap-3">
																			<span className="truncate">
																				{option.label}
																			</span>
																			<div className="flex items-center gap-2">
																				{option.pricingLabel && (
																					<span className="text-xs text-muted-foreground whitespace-nowrap">
																						{option.pricingLabel}
																					</span>
																				)}
																				{option.badge && (
																					<ModelBadge badge={option.badge} />
																				)}
																			</div>
																		</div>
																	</SelectItem>
																))}
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

							<Section title="Image Generation">
								<FormField
									control={form.control}
									name="saveImagesToVault"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
											<div className="space-y-1">
												<FormLabel>Save images to Vault</FormLabel>
												<FormDescription>
													Store generated images in Supabase storage and show
													them in Vault and executions.
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={Boolean(field.value)}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</Section>

							<Section title="Consumption Notifications">
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="notificationThreshold"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Call Threshold</FormLabel>
												<FormControl>
													<Input
														type="number"
														placeholder="e.g., 100"
														{...field}
														value={field.value ?? ""}
														onChange={(e) =>
															field.onChange(
																e.target.value
																	? Number.parseInt(e.target.value, 10)
																	: null,
															)
														}
														// Disable threshold input if interval is null or undefined
														disabled={watchedInterval == null}
													/>
												</FormControl>
												<FormDescription>
													Number of API calls within the interval to trigger a
													notification.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="notificationIntervalSeconds"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Time Interval</FormLabel>
												<Select
													value={field.value?.toString() ?? "none"}
													onValueChange={(value) =>
														field.onChange(
															value === "none"
																? null
																: Number.parseInt(value, 10),
														)
													}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select an interval" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="none">
															None (Disable Notifications)
														</SelectItem>
														<SelectItem value="60">1 Minute</SelectItem>
														<SelectItem value="300">5 Minutes</SelectItem>
														<SelectItem value="3600">1 Hour</SelectItem>
														<SelectItem value="86400">1 Day</SelectItem>
													</SelectContent>
												</Select>
												<FormDescription>
													Time window to check the call threshold.
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
								onCancel={() => {}}
								onConfirm={() => form.reset()}
								title="Reset Changes?"
								description="This will reset all changes you've made. This action cannot be undone."
							/>
						</AlertDialog>
						<Button
							type="submit"
							disabled={updateProject.isPending || !form.formState.isDirty}
						>
							{updateProject.isPending ? (
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
