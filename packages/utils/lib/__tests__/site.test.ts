import { describe, expect, test } from "bun:test";
import {
	APP_ORIGIN,
	NEW_AUTH_USER_WINDOW_MS,
	SITE_COPY,
	getAppAuthUrl,
	getAuthCtaLabel,
	getAuthEntryPath,
	isNewlyCreatedAuthUser,
	isRegistrationEnabled,
} from "../site";

describe("isRegistrationEnabled", () => {
	test("defaults to closed when env is unset", () => {
		expect(isRegistrationEnabled(undefined)).toBe(false);
		expect(isRegistrationEnabled("")).toBe(false);
	});

	test("opens when env is true", () => {
		expect(isRegistrationEnabled("true")).toBe(true);
	});

	test("stays closed when env is false", () => {
		expect(isRegistrationEnabled("false")).toBe(false);
	});
});

describe("auth entry helpers", () => {
	test("send new users to login while registration is closed", () => {
		expect(getAuthEntryPath()).toBe("/login");
		expect(getAppAuthUrl()).toBe(`${APP_ORIGIN}/login`);
		expect(getAuthCtaLabel("Start Free Trial")).toBe(SITE_COPY.authCtaLabel);
	});
});

describe("isNewlyCreatedAuthUser", () => {
	test("treats a just-created auth user as new", () => {
		const now = Date.parse("2026-10-10T08:00:00.000Z");
		expect(
			isNewlyCreatedAuthUser({ created_at: "2026-10-10T07:59:30.000Z" }, now),
		).toBe(true);
	});

	test("allows accounts older than the new-user window", () => {
		const now = Date.parse("2026-10-10T08:00:00.000Z");
		expect(
			isNewlyCreatedAuthUser(
				{
					created_at: new Date(now - NEW_AUTH_USER_WINDOW_MS - 1).toISOString(),
				},
				now,
			),
		).toBe(false);
	});

	test("ignores invalid created_at values", () => {
		expect(isNewlyCreatedAuthUser({ created_at: "not-a-date" })).toBe(false);
	});
});
