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
  FormMessage,
} from "@proxed/ui/components/form";
import { Input } from "@proxed/ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@proxed/ui/components/card";

const formSchema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const { setApiErrorsToForm } = useFormErrors();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }: FormValues) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: new URL("/auth/token", window.location.origin).toString(),
      });

      if (error) throw error;

      // Redirect regardless of success for security
      const redirectSearchParams = new URLSearchParams({
        type: "PASSWORD_RESET",
        identifier: email,
        redirectTo: "/auth/reset-password",
      });

      router.replace(`/auth/token?${redirectSearchParams.toString()}`);
    } catch (e) {
      setApiErrorsToForm(e, form, {
        defaultError: "Failed to send reset link",
      });
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {form.formState.isSubmitted && form.formState.errors.root && (
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
                      <Input {...field} type="email" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                Send Reset Link
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Remember your password?{" "}
                </span>
                <Link href="/login" className="hover:underline">
                  Sign in
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
