import { Cookies } from "@/utils/constants";
import { createClient as createAdminClient } from "@proxed/supabase/job";
import { createClient } from "@proxed/supabase/server";
import {
	isNewlyCreatedAuthUser,
	isRegistrationEnabled,
} from "@proxed/utils/lib/site";
import { addYears } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const cookieStore = await cookies();
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");

	// Prioritize 'redirectTo' from the callback URL's params,
	// which is set by the login/signup forms.
	// Fall back to 'next' if 'redirectTo' is missing.
	const finalRedirectPath =
		searchParams.get("redirectTo") ?? searchParams.get("next") ?? "/";

	const provider = searchParams.get("provider");

	if (provider) {
		cookieStore.set(Cookies.PreferredSignInProvider, provider, {
			expires: addYears(new Date(), 1),
		});
	}

	const forwardedHost = request.headers.get("x-forwarded-host");
	const isLocalEnv = process.env.NODE_ENV === "development";
	const resolvedOrigin =
		isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`;

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			if (!isRegistrationEnabled()) {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user && isNewlyCreatedAuthUser(user)) {
					const admin = createAdminClient();
					await admin.auth.admin.deleteUser(user.id);
					await supabase.auth.signOut();
					return NextResponse.redirect(
						`${resolvedOrigin}/login?error=signup_disabled`,
					);
				}
			}

			return NextResponse.redirect(`${resolvedOrigin}${finalRedirectPath}`);
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
