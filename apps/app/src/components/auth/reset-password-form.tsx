"use client";

import { useFormErrors } from "@/hooks/form-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@proxed/supabase/client";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { Button } from "@proxed/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "./auth-card";

const formSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
	const supabase = createClient();
	const router = useRouter();
	const { setApiErrorsToForm } = useFormErrors();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async ({ password }: FormValues) => {
		try {
			const { error } = await supabase.auth.updateUser({
				password,
			});

			if (error) throw error;

			// Sign out the user after password reset
			await supabase.auth.signOut();
			router.replace("/login?message=password_updated");
		} catch (e) {
			setApiErrorsToForm(e, form, {
				defaultError: "Failed to update password",
			});
		}
	};

	return (
		<AuthCard title="Reset Password" description="Enter your new password">
			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					{form.formState.isSubmitted &&
						form.formState.errors.root?.message && (
							<Alert variant="destructive">
								<AlertTriangleIcon className="size-6" />
								<AlertDescription>
									{form.formState.errors.root.message}
								</AlertDescription>
							</Alert>
						)}

					<div className="grid gap-4">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showPassword ? "text" : "password"}
												className="pr-10"
												{...field}
												autoComplete="new-password"
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary text-xl"
											>
												{showPassword ? (
													<EyeOffIcon className="size-4" />
												) : (
													<EyeIcon className="size-4" />
												)}
											</button>
										</div>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showConfirmPassword ? "text" : "password"}
												className="pr-10"
												{...field}
												autoComplete="new-password"
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary text-xl"
											>
												{showConfirmPassword ? (
													<EyeOffIcon className="size-4" />
												) : (
													<EyeIcon className="size-4" />
												)}
											</button>
										</div>
									</FormControl>
								</FormItem>
							)}
						/>

						<Button
							className="w-full"
							variant="secondary"
							type="submit"
							disabled={form.formState.isSubmitting}
						>
							Update Password
						</Button>
					</div>
				</form>
			</Form>
		</AuthCard>
	);
}
