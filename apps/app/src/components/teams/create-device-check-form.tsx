"use client";

import { createDeviceCheckAction } from "@/actions/create-device-check-action";
import {
	type CreateDeviceCheckFormValues,
	createDeviceCheckSchema,
} from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
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
	ChevronRight,
	Info,
	ExternalLink,
	BookOpen,
	AlertCircle,
	HelpCircle,
	ChevronDown,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { TeamCard } from "./team-card";
import Link from "next/link";
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

export function CreateDeviceCheckForm() {
	const { toast } = useToast();
	const form = useForm<CreateDeviceCheckFormValues>({
		resolver: zodResolver(createDeviceCheckSchema),
		defaultValues: {
			name: "",
			key_id: "",
			private_key_p8: "",
			apple_team_id: "",
		},
		mode: "onChange",
	});

	const createDeviceCheck = useAction(createDeviceCheckAction, {
		onSuccess: () => {
			toast({
				title: "Device Check configuration created",
				description: "Your device check has been set up successfully",
			});
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description:
					error?.error?.serverError || "Failed to create Device Check",
			});
		},
	});

	function onSubmit(values: CreateDeviceCheckFormValues) {
		createDeviceCheck.execute({
			...values,
			redirectTo: "/teams/keys",
		});
	}

	return (
		<TeamCard
			title="Configure Device Check"
			description="Set up Apple Device Check for your application"
		>
			<div className="flex items-end justify-end mb-2">
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
							Apple DeviceCheck helps you identify and prevent fraud by securely
							tracking device data, even after app reinstallation or device
							reset.
						</p>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-3">
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
								name="key_id"
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
								name="apple_team_id"
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
							name="private_key_p8"
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
													} catch (error) {
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
					</div>

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

					<div className="pt-4 border-t mt-4">
						<div className="flex items-center justify-between">
							<Link href="/teams/keys">
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
								size="sm"
								disabled={
									createDeviceCheck.status === "executing" ||
									!form.formState.isValid
								}
								className={cn(
									"px-6",
									form.formState.isValid ? "bg-primary" : "bg-primary/80",
								)}
							>
								{createDeviceCheck.status === "executing" ? (
									<>
										<Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
										Configuring...
									</>
								) : (
									<>
										Create Configuration
										<ChevronRight className="h-3.5 w-3.5 ml-2" />
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
