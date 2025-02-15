import { TokenVerificationForm } from "@/components/auth/token-verification-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Verify Token | Proxed",
};

export default function TokenPage() {
	return <TokenVerificationForm />;
}
