/**
 * Flip to `true` to reopen new-user registration.
 * `NEXT_PUBLIC_REGISTRATION_ENABLED=true|false` overrides this constant.
 */
export const REGISTRATION_ENABLED = false;

export const NEW_AUTH_USER_WINDOW_MS = 15 * 60 * 1000;

/** First-login timestamps can lag `created_at` by a few seconds. */
export const FIRST_SIGN_IN_SLACK_MS = 60 * 1000;

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

export type AuthUserSnapshot = {
	created_at: string;
	last_sign_in_at?: string | null;
	identities?: Array<{ created_at?: string | null }> | null;
};

export function resolveRegistrationFlag(envValue: string | undefined): boolean {
	if (envValue === "true") {
		return true;
	}
	if (envValue === "false") {
		return false;
	}
	return REGISTRATION_ENABLED;
}

export function isRegistrationEnabled(): boolean {
	return resolveRegistrationFlag(process.env.NEXT_PUBLIC_REGISTRATION_ENABLED);
}

export function getAuthEntryPath(
	enabled = isRegistrationEnabled(),
): "/login" | "/signup" {
	return enabled ? "/signup" : "/login";
}

export function getAppAuthUrl(
	appOrigin = APP_ORIGIN,
	enabled = isRegistrationEnabled(),
): string {
	return `${appOrigin}${getAuthEntryPath(enabled)}`;
}

export function getAuthCtaLabel(
	openLabel: string,
	enabled = isRegistrationEnabled(),
): string {
	return enabled ? openLabel : SITE_COPY.authCtaLabel;
}

export function getAuthAnalyticsEvent(
	enabled = isRegistrationEnabled(),
): "Signup" | "Login" {
	return enabled ? "Signup" : "Login";
}

function isTimestampWithinWindow(
	value: string | null | undefined,
	now: number,
	windowMs: number,
): boolean {
	if (!value) {
		return false;
	}
	const parsed = Date.parse(value);
	if (Number.isNaN(parsed)) {
		return false;
	}
	return now - parsed < windowMs;
}

export function isNewlyCreatedAuthUser(
	user: AuthUserSnapshot,
	now = Date.now(),
): boolean {
	if (!isTimestampWithinWindow(user.created_at, now, NEW_AUTH_USER_WINDOW_MS)) {
		return false;
	}

	const createdAt = Date.parse(user.created_at);
	if (user.last_sign_in_at) {
		const lastSignIn = Date.parse(user.last_sign_in_at);
		if (
			!Number.isNaN(lastSignIn) &&
			lastSignIn - createdAt > FIRST_SIGN_IN_SLACK_MS
		) {
			return false;
		}
	}

	const identities = user.identities ?? [];
	if (identities.length === 0) {
		return true;
	}

	return identities.every((identity) =>
		isTimestampWithinWindow(identity.created_at, now, NEW_AUTH_USER_WINDOW_MS),
	);
}
