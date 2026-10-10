import { RegistrationClosed } from "@/components/auth/registration-closed";
import { SignupForm } from "@/components/auth/signup-form";
import { isRegistrationEnabled } from "@proxed/utils/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign Up | Proxed",
};

export default function SignUpPage() {
	if (!isRegistrationEnabled()) {
		return <RegistrationClosed />;
	}

	return <SignupForm />;
}
