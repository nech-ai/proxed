"use client";

import { createProviderKeyAction } from "@/actions/create-provider-key-action";
import {
	type CreateProviderKeyFormValues,
	createProviderKeySchema,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import { Switch } from "@proxed/ui/components/switch";
import { toast, useToast } from "@proxed/ui/hooks/use-toast";
import { Loader2, Check, Copy, AlertCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import {
	splitKeyWithPrefix,
	KeyValidationError,
	validateApiKey,
	type KeyValidationResult,
} from "@proxed/utils/lib/partial-keys";
import { useState } from "react";
import { cn } from "@proxed/ui/utils";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";

interface ProviderKeyCreateFormProps {
	onSuccess?: () => void;
	revalidatePath?: string;
}

export enum ProviderType {
	OPENAI = "OPENAI",
	ANTHROPIC = "ANTHROPIC",
	GOOGLE = "GOOGLE",
	MISTRAL = "MISTRAL",
}

export function ProviderKeyCreateForm({
	onSuccess,
	revalidatePath,
}: ProviderKeyCreateFormProps) {
	const [clientPart, setClientPart] = useState<string>("");
	const [savedClientPart, setSavedClientPart] = useState<string>("");
	const [keyValidation, setKeyValidation] = useState<KeyValidationResult>({
		isValid: false,
	});
	const { toast } = useToast();

	const form = useForm<CreateProviderKeyFormValues>({
		resolver: zodResolver(createProviderKeySchema),
		defaultValues: {
			display_name: "",
			partial_key_server: "",
			provider: ProviderType.OPENAI,
			is_active: true,
			revalidatePath,
		},
	});

	const createProviderKey = useAction(createProviderKeyAction, {
		onSuccess: () => {
			setSavedClientPart(clientPart);
			setClientPart("");
			form.reset();
			toast({
				title: "Partial Key created",
				description: "The Partial Key has been created successfully.",
			});
			onSuccess?.();
		},
		onError: (error) => {
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

		if (validation.isValid) {
			try {
				const { serverPart, clientPart } = splitKeyWithPrefix(value);
				form.setValue("partial_key_server", serverPart, { shouldDirty: true });
				setClientPart(clientPart);

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
			}
		} else {
			form.setValue("partial_key_server", "", { shouldDirty: true });
			setClientPart("");
		}
	};

	const onSubmit = form.handleSubmit((data) => {
		createProviderKey.execute(data);
	});

	return (
		<Form {...form}>
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Create Partial Key</CardTitle>
						<CardDescription>
							Paste your API key below to split it into server and client parts.
						</CardDescription>
					</CardHeader>

					{savedClientPart && (
						<div className="mx-6 mb-4">
							<Alert className="bg-yellow-50 border-yellow-200">
								<AlertCircle className="h-4 w-4 text-yellow-600" />
								<div className="ml-2">
									<div className="font-medium text-yellow-800 mb-1">
										Copy Your Client Key Part
									</div>
									<div className="flex items-center gap-2">
										<Input
											readOnly
											value={savedClientPart}
											className="font-mono text-sm bg-white border-yellow-200"
										/>
										<CopyToClipboard value={savedClientPart} />
									</div>
									<p className="mt-2 text-sm text-yellow-700">
										⚠️ Make sure to copy this key part now. You won't be able to
										see it again!
									</p>
								</div>
							</Alert>
						</div>
					)}

					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="display_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder={
												keyValidation.provider
													? `${keyValidation.provider} Key`
													: "My Partial Key"
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
									<FormLabel>Provider</FormLabel>
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
							<FormLabel>API Key</FormLabel>
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
									<AlertDescription>{keyValidation.error}</AlertDescription>
								</Alert>
							)}
						</FormItem>

						<FormField
							control={form.control}
							name="is_active"
							render={({ field: { onChange, ...field } }) => (
								<FormItem>
									<FormLabel>Active</FormLabel>
									<FormControl>
										<Switch checked={field.value} onChange={onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>

					<CardFooter className="flex justify-end">
						<Button
							type="submit"
							disabled={
								createProviderKey.status === "executing" ||
								!form.formState.isDirty
							}
						>
							{createProviderKey.status === "executing" ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create Partial Key"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}

function CopyToClipboard({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Failed to copy",
				description: "Please try copying manually",
			});
		}
	};

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			onClick={onCopy}
			className="h-8 w-8"
			title={copied ? "Copied!" : "Copy to clipboard"}
		>
			{copied ? (
				<Check className="h-4 w-4 text-green-500" />
			) : (
				<Copy className="h-4 w-4" />
			)}
		</Button>
	);
}
