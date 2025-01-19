"use client";

import { useFormErrors } from "@/hooks/form-errors";
import { createClient } from "@proxed/supabase/client";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { Button } from "@proxed/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@proxed/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SigninModeSwitch from "./signin-mode-switch";
import { TeamInvitationInfo } from "./team-invitation-info";

const formSchema = z.object({
  email: z.string().email(),
  password: z.optional(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

const linkClasses = "hover:underline text-sm text-muted-foreground";
const textClasses = "text-center text-muted-foreground text-sm";

export function LoginForm() {
  const supabase = createClient();
  const { setApiErrorsToForm } = useFormErrors();
  const router = useRouter();

  const [signinMode, setSigninMode] = useState<"password" | "magic-link">(
    "password",
  );

  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: email ?? "", password: "" },
  });

  const invitationCode = searchParams.get("invitationCode");
  const redirectTo = invitationCode
    ? `/api/team/invitation/${invitationCode}`
    : (searchParams.get("redirectTo") ?? "/");

  useEffect(() => {
    form.reset();
  }, [signinMode]);

  const onSubmit: SubmitHandler<FormValues> = async ({ email, password }) => {
    try {
      const redirectSearchParams = new URLSearchParams();
      redirectSearchParams.set("type", "LOGIN");
      redirectSearchParams.set("redirectTo", redirectTo);
      if (invitationCode) {
        redirectSearchParams.set("invitationCode", invitationCode);
      }
      if (email) {
        redirectSearchParams.set("identifier", email);
      }
      if (signinMode === "password") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: password as string,
        });
        if (signInError) throw signInError;
        router.push(redirectTo);
      } else {
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback?${redirectSearchParams.toString()}`,
          },
        });
        if (signInError) throw signInError;
        router.push(`/auth/token?${redirectSearchParams.toString()}`);
      }
    } catch (e) {
      setApiErrorsToForm(e, form, {
        defaultError: "Invalid credentials",
      });
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {invitationCode && <TeamInvitationInfo className="mb-6" />}

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <SigninModeSwitch
              className="w-full"
              activeMode={signinMode}
              onChangeAction={(value) =>
                setSigninMode(value as typeof signinMode)
              }
            />

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

              {signinMode === "password" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className={linkClasses}
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            {...field}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
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
              )}

              <Button
                className="w-full"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {signinMode === "password" ? "Sign in" : "Send magic link"}
              </Button>

              <div className={textClasses}>
                Don&apos;t have an account?{" "}
                <Link
                  href={`/signup${
                    invitationCode
                      ? `?invitationCode=${invitationCode}&email=${email}`
                      : ""
                  }`}
                  className={linkClasses}
                >
                  Create an account
                  <ArrowRightIcon className="ml-1 inline size-3 align-middle" />
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
