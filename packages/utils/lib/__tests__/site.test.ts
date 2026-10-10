import { describe, expect, test } from "bun:test";
import {
	APP_ORIGIN,
	FIRST_SIGN_IN_SLACK_MS,
	NEW_AUTH_USER_WINDOW_MS,
	SITE_COPY,
	getAppAuthUrl,
	getAuthAnalyticsEvent,
	getAuthCtaLabel,
	getAuthEntryPath,
	isNewlyCreatedAuthUser,
	resolveRegistrationFlag,
} from "../site";

describe("resolveRegistrationFlag", () => {
	test("defaults to closed when env is unset", () => {
		expect(resolveRegistrationFlag(undefined)).toBe(false);
		expect(resolveRegistrationFlag("")).toBe(false);
	});

	test("opens when env is true", () => {
		expect(resolveRegistrationFlag("true")).toBe(true);
	});

	test("stays closed when env is false", () => {
		expect(resolveRegistrationFlag("false")).toBe(false);
	});
});

describe("auth entry helpers", () => {
	test("send new users to login while registration is closed", () => {
		expect(getAuthEntryPath(false)).toBe("/login");
		expect(getAppAuthUrl(APP_ORIGIN, false)).toBe(`${APP_ORIGIN}/login`);
		expect(getAuthCtaLabel("Start Free Trial", false)).toBe(
			SITE_COPY.authCtaLabel,
		);
		expect(getAuthAnalyticsEvent(false)).toBe("Login");
	});

	test("send new users to signup when registration is open", () => {
		expect(getAuthEntryPath(true)).toBe("/signup");
		expect(getAppAuthUrl(APP_ORIGIN, true)).toBe(`${APP_ORIGIN}/signup`);
		expect(getAuthCtaLabel("Start Free Trial", true)).toBe("Start Free Trial");
		expect(getAuthAnalyticsEvent(true)).toBe("Signup");
	});
});

describe("isNewlyCreatedAuthUser", () => {
	const now = Date.parse("2026-10-10T08:00:00.000Z");

	test("treats a first-login auth user as new", () => {
		expect(
			isNewlyCreatedAuthUser(
				{
					created_at: "2026-10-10T07:59:30.000Z",
					last_sign_in_at: "2026-10-10T07:59:31.000Z",
					identities: [{ created_at: "2026-10-10T07:59:30.000Z" }],
				},
				now,
			),
		).toBe(true);
	});

	test("allows accounts older than the new-user window", () => {
		expect(
			isNewlyCreatedAuthUser(
				{
					created_at: new Date(now - NEW_AUTH_USER_WINDOW_MS - 1).toISOString(),
				},
				now,
			),
		).toBe(false);
	});

	test("allows a recent account whose next sign-in is after the first-login slack", () => {
		const createdAt = new Date(now - 5 * 60 * 1000).toISOString();
		expect(
			isNewlyCreatedAuthUser(
				{
					created_at: createdAt,
					last_sign_in_at: new Date(
						Date.parse(createdAt) + FIRST_SIGN_IN_SLACK_MS + 1,
					).toISOString(),
				},
				now,
			),
		).toBe(false);
	});

	test("allows a recent account that already has an older identity", () => {
		expect(
			isNewlyCreatedAuthUser(
				{
					created_at: "2026-10-10T07:59:30.000Z",
					identities: [
						{ created_at: "2026-10-10T07:59:30.000Z" },
						{
							created_at: new Date(
								now - NEW_AUTH_USER_WINDOW_MS - 1,
							).toISOString(),
						},
					],
				},
				now,
			),
		).toBe(false);
	});

	test("ignores invalid created_at values", () => {
		expect(isNewlyCreatedAuthUser({ created_at: "not-a-date" }, now)).toBe(
			false,
		);
	});
});
