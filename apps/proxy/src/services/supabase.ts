import type { Database } from "@proxed/supabase/types";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createClient(accessToken?: string) {
	return createSupabaseClient<Database>(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_KEY!,
		{
			accessToken() {
				return Promise.resolve(accessToken || "");
			},
		},
	);
}
