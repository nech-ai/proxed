import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cookies } from "@/utils/constants";

export const metadata: Metadata = {
	title: "Login",
};

export default async function Page() {
	const cookieStore = await cookies();
	const preferred = cookieStore.get(Cookies.PreferredSignInProvider);
	return <LoginForm preferredSignInProvider={preferred?.value} />;
}
