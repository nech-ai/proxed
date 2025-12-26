import type { Database } from "@proxed/supabase/types";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null =
	null;

export function createAdminClient() {
	if (!adminClient) {
		adminClient = createSupabaseClient<Database>(
			process.env.SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!,
		);
	}

	return adminClient;
}

export function createClient(accessToken?: string) {
	return createSupabaseClient<Database>(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			accessToken() {
				return Promise.resolve(accessToken || "");
			},
		},
	);
}
