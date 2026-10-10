import type { Client } from "@proxed/supabase/types";
import {
	type AuthUserSnapshot,
	isNewlyCreatedAuthUser,
} from "@proxed/utils/lib/site";

export async function isClosedRegistrationSignup(
	supabase: Client,
	user: AuthUserSnapshot & { id: string },
): Promise<boolean> {
	if (!isNewlyCreatedAuthUser(user)) {
		return false;
	}

	const { data } = await supabase
		.from("team_memberships")
		.select("id")
		.eq("user_id", user.id)
		.limit(1);

	return (data?.length ?? 0) === 0;
}
