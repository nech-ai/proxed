"use client";

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@proxed/ui/components/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@proxed/ui/components/card";

const REGEXP_ONLY_DIGITS_AND_CHARS = /^[0-9]*$/;

const tokenSchema = z.object({
  token: z
    .string()
    .length(6, "Token must be 6 characters")
    .regex(REGEXP_ONLY_DIGITS_AND_CHARS, "Please enter only numbers"),
});

type TokenSchema = z.infer<typeof tokenSchema>;

export function TokenVerificationCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("identifier") || searchParams.get("email");
  const type = searchParams.get("type")?.toUpperCase() ?? "SIGNUP";
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const supabase = createClient();

  const getHeaderText = () => {
    switch (type) {
      case "SIGNUP":
        return "Verify Email";
      case "LOGIN":
        return "Magic Link";
      case "PASSWORD_RESET":
        return "Reset Password";
      default:
        return "Verify Token";
    }
  };

  const getDescriptionText = () => {
    switch (type) {
      case "SIGNUP":
        return "Enter the verification code sent to your email";
      case "LOGIN":
        return "Enter the magic link code sent to your email";
      case "PASSWORD_RESET":
        return "Enter the password reset code sent to your email";
      default:
        return "Enter the verification code sent to your email";
    }
  };

  const form = useForm<TokenSchema>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: "",
    },
  });

  async function onSubmit(data: TokenSchema) {
    if (!email) {
      setError("Email not found in URL parameters");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let verificationError: Error | null = null;

      switch (type) {
        case "PASSWORD_RESET": {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: data.token,
            type: "recovery",
          });
          verificationError = error;
          break;
        }
        case "LOGIN": {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: data.token,
            type: "magiclink",
          });
          verificationError = error;
          break;
        }
        // case "SIGNUP":
        default: {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: data.token,
            type: "signup",
          });
          verificationError = error;
          break;
        }
      }

      if (verificationError) throw verificationError;

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify token");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{getHeaderText()}</CardTitle>
        <CardDescription>
          {getDescriptionText()} <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="token"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS.source}
                        {...field}
                        onChange={(value) => onChange(value)}
                        disabled={isLoading}
                        className="w-full justify-center gap-2"
                      >
                        <InputOTPGroup className="w-full gap-2">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-12 flex-1 rounded-md border text-lg"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Verify Token
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
