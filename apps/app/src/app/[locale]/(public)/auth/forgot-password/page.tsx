import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Footer } from "@/components/layout/footer";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/layout/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex w-full justify-end p-4">
        <ThemeToggle />
      </header>

      <div className="flex w-full flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-8 h-20 w-48">
            <Logo className="h-full w-full" withLabel={false} />
          </div>
          <ForgotPasswordForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
