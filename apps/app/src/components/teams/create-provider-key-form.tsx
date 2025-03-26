"use client";

import { createProviderKeyAction } from "@/actions/create-provider-key-action";
import {
	type CreateProviderKeyFormValues,
	createProviderKeySchema,
} from "@/actions/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@proxed/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
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
import {
	Loader2,
	Check,
	Copy,
	AlertCircle,
	ChevronRight,
	Info,
	ExternalLink,
	BookOpen,
	HelpCircle,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import {
	splitKeyWithPrefix,
	KeyValidationError,
	validateApiKey,
	type KeyValidationResult,
} from "@proxed/utils/lib/partial-keys";
import { useState, useEffect, useRef } from "react";
import { cn } from "@proxed/ui/utils";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { TeamCard } from "./team-card";
import Link from "next/link";
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

const cryptoProvider =
	typeof window !== "undefined"
		? window.crypto
		: require("node:crypto").webcrypto;

export enum ProviderType {
	OPENAI = "OPENAI",
	ANTHROPIC = "ANTHROPIC",
}

interface FormState {
	isCreating: boolean;
	isSuccess: boolean;
	isSubmitting: boolean;
}

export function CreateProviderKeyForm() {
	const { toast } = useToast();
	const [clientPart, setClientPart] = useState<string>("");
	const [savedClientPart, setSavedClientPart] = useState<string>("");
	const clientPartRef = useRef<string>("");
	const [keyValidation, setKeyValidation] = useState<KeyValidationResult>({
		isValid: false,
	});

	const [formState, setFormState] = useState<FormState>({
		isCreating: true,
		isSuccess: false,
		isSubmitting: false,
	});

	const form = useForm<CreateProviderKeyFormValues>({
		resolver: zodResolver(createProviderKeySchema),
		defaultValues: {
			display_name: "",
			partial_key_server: "",
			provider: ProviderType.OPENAI,
		},
	});

	useEffect(() => {
		return () => {
			setClientPart("");
			setSavedClientPart("");
			clientPartRef.current = "";
		};
	}, []);

	const createProviderKey = useAction(createProviderKeyAction, {
		onExecute: () => setFormState((prev) => ({ ...prev, isSubmitting: true })),
		onSuccess: () => {
			setSavedClientPart(clientPartRef.current);

			setFormState({
				isCreating: false,
				isSuccess: true,
				isSubmitting: false,
			});

			form.reset({
				display_name: "",
				partial_key_server: "",
				provider: ProviderType.OPENAI,
			});

			setKeyValidation({ isValid: false });
			clientPartRef.current = "";
			setClientPart("");

			toast({
				title: "✅ Partial Key created",
				description:
					"Please copy your client key part below. You won't see it again!",
				variant: "default",
				duration: 10000,
			});
		},
		onError: (error) => {
			setFormState((prev) => ({ ...prev, isSubmitting: false }));
			toast({
				variant: "destructive",
				title: "Error",
				description:
					error?.error?.serverError || "Failed to create Partial Key",
			});
		},
	});

	const handleKeyInput = (value: string) => {
		const validation = validateApiKey(value);
		setKeyValidation(validation);

		if (!validation.isValid) {
			clientPartRef.current = "";
			setClientPart("");
			form.setValue("partial_key_server", "", { shouldDirty: false });
			return;
		}

		try {
			const { serverPart, clientPart: generatedClientPart } =
				splitKeyWithPrefix(value, cryptoProvider);
			clientPartRef.current = generatedClientPart;
			setClientPart(generatedClientPart);

			form.clearErrors();
			form.setValue("partial_key_server", serverPart, { shouldDirty: true });

			if (validation.provider) {
				form.setValue("provider", validation.provider, { shouldDirty: true });
				if (!form.getValues("display_name")) {
					form.setValue("display_name", `${validation.provider} Key`, {
						shouldDirty: true,
					});
				}
			}
		} catch (error) {
			if (error instanceof KeyValidationError) {
				toast({
					variant: "destructive",
					title: "Invalid Key Format",
					description: error.message,
				});
			}
			clientPartRef.current = "";
			setClientPart("");
			form.setValue("partial_key_server", "", { shouldDirty: false });
		}
	};

	const resetForm = () => {
		setFormState({
			isCreating: true,
			isSuccess: false,
			isSubmitting: false,
		});
		setClientPart("");
		setSavedClientPart("");
		clientPartRef.current = "";
		setKeyValidation({ isValid: false });
		form.reset({
			display_name: "",
			partial_key_server: "",
			provider: ProviderType.OPENAI,
		});
	};

	return (
		<TeamCard
			title={formState.isSuccess ? "Save Your Client Key Part" : "Add API Key"}
			description={
				formState.isSuccess
					? "Copy and save this key part now - you won't see it again!"
					: "Securely store your API key by splitting it into server and client parts"
			}
		>
			<div className="flex items-end justify-end mb-2">
				<a
					href="https://docs.proxed.ai/partial-keys"
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
				>
					<BookOpen className="h-3.5 w-3.5" />
					<span>Documentation</span>
					<ExternalLink className="h-3 w-3" />
				</a>
			</div>

			{formState.isCreating && (
				<Accordion type="single" collapsible className="mb-4">
					<AccordionItem
						value="about"
						className="border rounded-md overflow-hidden"
					>
						<AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
							<div className="flex items-center gap-2">
								<Info className="h-4 w-4 text-blue-500" />
								<span>What are Partial Keys?</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="px-3 pb-3">
							<p className="text-sm text-muted-foreground mb-2">
								Partial keys split your API key into two separate parts:
							</p>
							<ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-2">
								<li>A server part stored securely on your servers</li>
								<li>A client part that users must provide</li>
							</ul>
							<p className="text-sm text-muted-foreground mb-2">
								This approach significantly enhances security by ensuring that
								no single location contains the complete API key.
							</p>
							<p className="text-sm font-medium mt-2">Security Benefits:</p>
							<ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
								<li>Reduced risk of key exposure</li>
								<li>Enhanced access control</li>
								<li>Audit trail for requests</li>
								<li>Easy revocation control</li>
								<li>Better key management</li>
							</ul>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			)}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit((data) =>
						createProviderKey.execute(data),
					)}
					className="space-y-5"
				>
					{formState.isSuccess ? (
						<div className="space-y-4">
							<Alert className="border-yellow-500/20 bg-yellow-500/10 dark:border-yellow-500/30 dark:bg-yellow-500/20">
								<AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
								<div className="ml-2">
									<div className="font-medium text-foreground">
										🔑 Copy Your Client Key Part
									</div>
									<p className="text-sm text-muted-foreground mt-1">
										⚠️ Save this key part now. For security reasons, you won't be
										able to see it again!
									</p>
								</div>
							</Alert>

							<div className="flex items-center gap-2 mt-2">
								<Input
									readOnly
									value={savedClientPart}
									className="font-mono text-sm bg-background border-border"
								/>
								<CopyToClipboard value={savedClientPart} />
							</div>

							<Accordion type="single" collapsible className="mt-4">
								<AccordionItem
									value="implementation"
									className="border rounded-md"
								>
									<AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
										<div className="flex items-center gap-2">
											<Info className="h-3.5 w-3.5 text-blue-500" />
											<span>How to use this client key in your app</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-3 pb-3 text-xs">
										<p className="text-muted-foreground mb-2">
											Include the client key part in your API requests to
											Proxed.AI:
										</p>
										<div className="bg-muted p-2 rounded-md font-mono text-xs mb-2 overflow-x-auto">
											const apiKey = "{savedClientPart}";
											<br />
											const endpoint = "https://api.proxed.ai/v1/openai/
											{"<your-project-id>"}";
										</div>
										<p className="text-muted-foreground mb-1 font-medium">
											Security Best Practices:
										</p>
										<ul className="text-muted-foreground list-disc pl-4 space-y-0.5">
											<li>
												Store client parts in environment variables, not in code
											</li>
											<li>Rotate partial keys periodically</li>
											<li>Use different keys for different environments</li>
											<li>Monitor usage patterns to detect abuse</li>
										</ul>
									</AccordionContent>
								</AccordionItem>
							</Accordion>

							<div className="flex items-center justify-between pt-4 mt-2 border-t">
								<Button
									variant="outline"
									type="button"
									onClick={resetForm}
									className="text-muted-foreground hover:text-foreground"
								>
									Add Another Key
								</Button>

								<Link href="/teams/billing">
									<Button className="px-6">
										Complete Setup
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								</Link>
							</div>
						</div>
					) : (
						<>
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="display_name"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center gap-2">
												<FormLabel>Name</FormLabel>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
														</TooltipTrigger>
														<TooltipContent
															side="right"
															className="max-w-[220px]"
														>
															A descriptive name to identify this API key
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
											<FormControl>
												<Input
													placeholder={
														keyValidation.provider
															? `${keyValidation.provider} Key`
															: "My API Key"
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="provider"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center gap-2">
												<FormLabel>Provider</FormLabel>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
														</TooltipTrigger>
														<TooltipContent
															side="right"
															className="max-w-[220px]"
														>
															The AI provider this key belongs to
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}
													disabled={!!keyValidation.provider}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select a provider" />
													</SelectTrigger>
													<SelectContent>
														{Object.values(ProviderType).map((provider) => (
															<SelectItem key={provider} value={provider}>
																{provider}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormItem>
									<div className="flex items-center gap-2">
										<FormLabel>API Key</FormLabel>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
												</TooltipTrigger>
												<TooltipContent side="right" className="max-w-[240px]">
													Your API key will be split into two parts. Only the
													server part will be stored, and you'll receive the
													client part to use in your app.
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<FormControl>
										<div className="relative">
											<Input
												type="password"
												placeholder="Paste your API key here"
												onChange={(e) => handleKeyInput(e.target.value)}
												className={cn(
													"pr-10",
													keyValidation.error && "border-destructive",
													keyValidation.isValid && "border-green-500",
													"transition-colors duration-200",
												)}
											/>
											{keyValidation.isValid && (
												<Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500 animate-in fade-in duration-200" />
											)}
										</div>
									</FormControl>
									{keyValidation.error && (
										<Alert
											variant="destructive"
											className="mt-2 animate-in slide-in-from-top-1 duration-200"
										>
											<AlertCircle className="h-4 w-4" />
											<AlertDescription>
												{keyValidation.error.message}
											</AlertDescription>
										</Alert>
									)}
								</FormItem>
							</div>

							<Accordion type="single" collapsible className="w-full mt-2">
								<AccordionItem value="help" className="border rounded-md">
									<AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
										<div className="flex items-center gap-2">
											<AlertCircle className="h-3.5 w-3.5 text-amber-500" />
											<span>How does the key splitting work?</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-3 pb-3 text-xs text-muted-foreground">
										<p className="mb-2">Partial keys work by:</p>
										<ul className="space-y-1 list-disc pl-4">
											<li>
												Splitting your original API key into two
												cryptographically linked parts
											</li>
											<li>
												The server part is stored securely in your Proxed
												database
											</li>
											<li>
												The client part is provided to you to share with your
												users or applications
											</li>
											<li>
												Both parts are required to reconstruct the original API
												key
											</li>
											<li>
												The system validates the reconstructed key before using
												it
											</li>
										</ul>
									</AccordionContent>
								</AccordionItem>
							</Accordion>

							<div className="pt-4 border-t mt-4">
								<div className="flex items-center justify-between">
									<Link href="/teams/billing">
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
										disabled={
											formState.isSubmitting ||
											!form.formState.isDirty ||
											!keyValidation.isValid
										}
										className="px-6"
									>
										{formState.isSubmitting ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Creating...
											</>
										) : (
											"Create Key"
										)}
									</Button>
								</div>
							</div>
						</>
					)}
				</form>
			</Form>
		</TeamCard>
	);
}

function CopyToClipboard({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);
	const { toast } = useToast();

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast({
				title: "✅ Copied!",
				description: "The client key part has been copied to your clipboard.",
				duration: 3000,
			});
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Failed to copy",
				description: "Please try copying manually by selecting the text",
			});
		}
	};

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			onClick={onCopy}
			className={cn(
				"h-9 w-9 transition-colors",
				copied && "border-green-500 text-green-500",
			)}
			title={copied ? "Copied!" : "Copy to clipboard"}
		>
			{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
		</Button>
	);
}
