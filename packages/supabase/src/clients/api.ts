import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Client } from "../types";
import type { Database } from "../types/db";

export const createClient = (accessToken?: string): Client =>
	createSupabaseClient<Database>(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			accessToken() {
				return Promise.resolve(accessToken || "");
			},
		},
	);
