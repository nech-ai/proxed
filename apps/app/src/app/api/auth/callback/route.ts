import { createClient } from "@proxed/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";

export async function GET(request: Request) {
	const cookieStore = await cookies();
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? "/";
	const provider = searchParams.get("provider");

	if (provider) {
		cookieStore.set(Cookies.PreferredSignInProvider, provider, {
			expires: addYears(new Date(), 1),
		});
	}

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			const forwardedHost = request.headers.get("x-forwarded-host");
			const isLocalEnv = process.env.NODE_ENV === "development";

			const redirectUrl = isLocalEnv
				? `${origin}${next}`
				: forwardedHost
					? `https://${forwardedHost}${next}`
					: `${origin}${next}`;

			return NextResponse.redirect(redirectUrl);
		}
	}

	// If there's an error, redirect to the token page if we have an email
	const email = searchParams.get("email");
	if (email) {
		return NextResponse.redirect(
			`${origin}/auth/token?email=${encodeURIComponent(email)}`,
		);
	}

	return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
