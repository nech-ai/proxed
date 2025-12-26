import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Client } from "../types";
import type { Database } from "../types/db";

export const createClient = (): Client =>
	createSupabaseClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.SUPABASE_SERVICE_ROLE_KEY as string,
		{
			global: {
				headers: {
					"sb-lb-routing-mode": "alpha-all-services",
				},
			},
		},
	);
