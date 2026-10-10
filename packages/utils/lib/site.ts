/**
 * Flip to `true` to reopen new-user registration.
 * `NEXT_PUBLIC_REGISTRATION_ENABLED=true|false` overrides this constant.
 */
export const REGISTRATION_ENABLED = false;

export const NEW_AUTH_USER_WINDOW_MS = 15 * 60 * 1000;

export const APP_ORIGIN = "https://app.proxed.ai";

export const SITE_COPY = {
	banner:
		"Proxed is changing direction. New registrations are paused while we work on what's next.",
	registrationClosedTitle: "Registration is closed",
	registrationClosedDescription:
		"We're not accepting new accounts while we work on what's next. Existing users can still sign in.",
	authCtaLabel: "Sign in",
	marketingCtaTitle: "Proxed is changing direction",
	marketingCtaDescription:
		"New registrations are paused. Existing customers can still sign in and use the product.",
} as const;

export function isRegistrationEnabled(
	value = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED,
): boolean {
	if (value === "true") {
		return true;
	}
	if (value === "false") {
		return false;
	}
	return REGISTRATION_ENABLED;
}

export function getAuthEntryPath(): "/login" | "/signup" {
	return isRegistrationEnabled() ? "/signup" : "/login";
}

export function getAppAuthUrl(appOrigin = APP_ORIGIN): string {
	return `${appOrigin}${getAuthEntryPath()}`;
}

export function getAuthCtaLabel(openLabel: string): string {
	return isRegistrationEnabled() ? openLabel : SITE_COPY.authCtaLabel;
}

export function isNewlyCreatedAuthUser(
	user: { created_at: string },
	now = Date.now(),
): boolean {
	const createdAt = Date.parse(user.created_at);
	if (Number.isNaN(createdAt)) {
		return false;
	}
	return now - createdAt < NEW_AUTH_USER_WINDOW_MS;
}
