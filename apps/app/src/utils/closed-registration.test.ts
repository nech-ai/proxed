import { describe, expect, test } from "bun:test";
import { isClosedRegistrationSignup } from "./closed-registration";

const createdAt = new Date(Date.now() - 30_000).toISOString();
const recentUser = {
	id: "user-1",
	created_at: createdAt,
	last_sign_in_at: createdAt,
	identities: [{ created_at: createdAt }],
};

function membershipClient(rows: Array<{ id: string }>) {
	return {
		from() {
			return {
				select() {
					return {
						eq() {
							return {
								limit: async () => ({ data: rows }),
							};
						},
					};
				},
			};
		},
	};
}

describe("isClosedRegistrationSignup", () => {
	test("rejects a first-login user with no team membership", async () => {
		expect(
			await isClosedRegistrationSignup(
				membershipClient([]) as never,
				recentUser,
			),
		).toBe(true);
	});

	test("keeps a first-login user who already has a team", async () => {
		expect(
			await isClosedRegistrationSignup(
				membershipClient([{ id: "membership-1" }]) as never,
				recentUser,
			),
		).toBe(false);
	});
});
