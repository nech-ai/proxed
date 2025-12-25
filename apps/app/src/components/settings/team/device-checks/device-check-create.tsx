"use client";

import {
	type CreateDeviceCheckFormValues,
	createDeviceCheckSchema,
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
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { Label } from "@proxed/ui/components/label";
import { useToast } from "@proxed/ui/hooks/use-toast";
import {
	Loader2,
	Upload,
	Info,
	ExternalLink,
	BookOpen,
	AlertCircle,
	HelpCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@proxed/ui/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@proxed/ui/components/accordion";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeviceCheckCreateFormProps {
	onSuccessAction?: () => void;
}

export function DeviceCheckCreateForm({
	onSuccessAction,
}: DeviceCheckCreateFormProps) {
	const { toast } = useToast();
	const form = useForm<CreateDeviceCheckFormValues>({
		resolver: zodResolver(createDeviceCheckSchema),
		defaultValues: {
			name: "",
			keyId: "",
			privateKeyP8: "",
			appleTeamId: "",
		},
		mode: "onChange",
	});

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const createDeviceCheck = useMutation(
		trpc.deviceChecks.create.mutationOptions({
			onSuccess: () => {
				form.reset();
				toast({
					title: "Device Check created",
					description:
						"The Device Check configuration has been created successfully.",
				});
				queryClient.invalidateQueries({
					queryKey: trpc.deviceChecks.list.queryKey(),
				});
				onSuccessAction?.();
			},
			onError: (error) => {
				toast({
					variant: "destructive",
					title: "Error",
					description: error?.message || "Failed to create Device Check",
				});
			},
		}),
	);

	const onSubmit = form.handleSubmit((data) => {
		createDeviceCheck.mutate({
			name: data.name,
			keyId: data.keyId,
			privateKeyP8: data.privateKeyP8,
			appleTeamId: data.appleTeamId,
		});
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Create Device Check Configuration</CardTitle>
								<CardDescription>
									Configure Apple Device Check for your application.
								</CardDescription>
							</div>
							<a
								href="https://docs.proxed.ai/device-check"
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
							>
								<BookOpen className="h-3.5 w-3.5" />
								<span>Documentation</span>
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>
					</CardHeader>

					<CardContent className="space-y-4">
						<Accordion type="single" collapsible className="mb-4">
							<AccordionItem
								value="about"
								className="border rounded-md overflow-hidden"
							>
								<AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
									<div className="flex items-center gap-2">
										<Info className="h-4 w-4 text-blue-500" />
										<span>What is Apple DeviceCheck?</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-3 pb-3">
									<p className="text-sm text-muted-foreground">
										Apple DeviceCheck helps you identify and prevent fraud by
										securely tracking device data, even after app reinstallation
										or device reset.
									</p>
								</AccordionContent>
							</AccordionItem>
						</Accordion>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center gap-2">
										<FormLabel className="text-sm font-medium">
											Configuration Name
										</FormLabel>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
												</TooltipTrigger>
												<TooltipContent side="right" className="max-w-[220px]">
													A descriptive name to identify this Device Check
													configuration
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<FormControl>
										<Input
											placeholder="My Device Check"
											{...field}
											className="h-9"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="keyId"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-sm font-medium">
												Key ID
											</FormLabel>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
													</TooltipTrigger>
													<TooltipContent side="top" className="max-w-[220px]">
														The Key ID from your Apple Developer account
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
										<FormControl>
											<Input
												placeholder="ABC123DEFG"
												{...field}
												className="h-9"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="appleTeamId"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-sm font-medium">
												Apple Team ID
											</FormLabel>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
													</TooltipTrigger>
													<TooltipContent side="top" className="max-w-[220px]">
														Your Apple Developer Team ID
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
										<FormControl>
											<Input
												placeholder="TEAM123456"
												{...field}
												className="h-9"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="privateKeyP8"
							render={({ field: { onChange, ...field } }) => (
								<FormItem>
									<div className="flex items-center gap-2">
										<FormLabel className="text-sm font-medium">
											Private Key (p8 file)
										</FormLabel>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
												</TooltipTrigger>
												<TooltipContent side="right" className="max-w-[260px]">
													Upload the p8 file downloaded from your Apple
													Developer account
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<FormControl>
										<div>
											<Input
												type="file"
												accept=".p8"
												className="hidden"
												id="p8-file"
												onChange={async (e) => {
													const file = e.target.files?.[0];
													if (!file) return;

													try {
														const content = await file.text();
														onChange(content);
														toast({
															title: "File loaded",
															description: `Successfully loaded ${file.name}`,
															duration: 3000,
														});
													} catch (_error) {
														toast({
															variant: "destructive",
															title: "Error",
															description: "Failed to read p8 file",
														});
													}
												}}
											/>
											<div
												className={cn(
													"border rounded-md transition-all",
													field.value
														? "border-green-500/30 bg-green-500/5"
														: "border-dashed hover:border-muted-foreground/50",
												)}
											>
												<Label
													htmlFor="p8-file"
													className={cn(
														"flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
														field.value
															? "text-green-600 dark:text-green-500"
															: "text-muted-foreground hover:text-foreground",
													)}
												>
													{field.value ? (
														<>
															<Info className="h-4 w-4 text-green-600 dark:text-green-500" />
															<span className="font-medium">File loaded</span>
														</>
													) : (
														<>
															<Upload className="h-4 w-4" />
															<span>Upload p8 file</span>
														</>
													)}
												</Label>
											</div>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Accordion type="single" collapsible className="w-full mt-2">
							<AccordionItem value="help" className="border rounded-md">
								<AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-3.5 w-3.5 text-amber-500" />
										<span>Where to find these credentials?</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-3 pb-3 text-xs text-muted-foreground">
									<ul className="space-y-1 list-disc pl-4">
										<li>Sign in to your Apple Developer Account</li>
										<li>Navigate to "Certificates, IDs & Profiles"</li>
										<li>Find Key ID in the "Keys" section</li>
										<li>Find Team ID at the top right of the page</li>
										<li>
											The p8 file is downloaded when creating a DeviceCheck key
										</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</CardContent>

					<CardFooter className="flex justify-end pt-2">
						<Button
							type="submit"
							disabled={createDeviceCheck.isPending || !form.formState.isValid}
							className={cn(
								form.formState.isValid ? "bg-primary" : "bg-primary/80",
							)}
						>
							{createDeviceCheck.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create configuration"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
