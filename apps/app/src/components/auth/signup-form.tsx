"use client";

import { useFormErrors } from "@/hooks/form-errors";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, ArrowRightIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "./auth-card";
import { PasswordInput } from "./password-input";
import { SocialAuth } from "./social-auth";
import { TeamInvitationInfo } from "./team-invitation-info";
import { AuthErrorAlert } from "./auth-error-alert";

const formSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8).max(255),
});

type FormValues = z.infer<typeof formSchema>;

export function SignupForm() {
	const supabase = createClient();
	const { zodErrorMap, setApiErrorsToForm } = useFormErrors();
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema, {
			errorMap: zodErrorMap,
		}),
		defaultValues: {
			name: "",
			email: email ?? "",
			password: "",
		},
	});

	const invitationCode = searchParams.get("invitationCode");
	const redirectTo = invitationCode
		? `/api/team/invitation/${invitationCode}`
		: (searchParams.get("redirectTo") ?? "/");

	const onSubmit: SubmitHandler<FormValues> = async ({
		name,
		email,
		password,
	}) => {
		try {
			const redirectSearchParams = new URLSearchParams();
			redirectSearchParams.set("type", "SIGNUP");
			redirectSearchParams.set("redirectTo", redirectTo);
			if (invitationCode) {
				redirectSearchParams.set("invitationCode", invitationCode);
			}
			if (email) {
				redirectSearchParams.set("identifier", email as string);
			}
			const { error: signUpError } = await supabase.auth.signUp({
				email: email as string,
				password: password as string,
				options: {
					data: {
						full_name: name as string,
					},
					emailRedirectTo: `${window.location.origin}/api/auth/callback?${redirectSearchParams.toString()}`,
				},
			});

			if (signUpError) throw signUpError;
			router.replace(`/auth/token?${redirectSearchParams.toString()}`);
		} catch (e) {
			setApiErrorsToForm(e, form, {
				defaultError: "Failed to sign up",
			});
		}
	};

	return (
		<AuthCard title="Sign up" description="Create your account">
			<AuthErrorAlert params={Object.fromEntries(searchParams)} />
			{invitationCode && <TeamInvitationInfo className="mb-6" />}

			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					{form.formState.isSubmitted &&
						form.formState.errors.root?.message && (
							<Alert variant="destructive">
								<AlertTriangleIcon className="size-4" />
								<AlertDescription>
									{form.formState.errors.root.message}
								</AlertDescription>
							</Alert>
						)}

					<div className="grid gap-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="name" />
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="email" />
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<PasswordInput {...field} autoComplete="new-password" />
									</FormControl>
								</FormItem>
							)}
						/>

						<Button
							className="w-full"
							type="submit"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting && (
								<Loader2Icon className="mr-2 size-4 animate-spin" />
							)}
							Sign up
						</Button>

						<div className="text-center text-sm">
							<span className="text-muted-foreground">
								Already have an account?{" "}
							</span>
							<Link
								href={`/login${
									invitationCode
										? `?invitationCode=${invitationCode}&email=${email}`
										: ""
								}`}
								className="hover:underline"
							>
								Sign in
								<ArrowRightIcon className="ml-1 inline size-3 align-middle" />
							</Link>
						</div>

						<SocialAuth />
					</div>
				</form>
			</Form>
		</AuthCard>
	);
}
