import { createBrowserClient } from "@supabase/ssr";
import type { Client, Database } from "../types";

export const createClient = (): Client =>
	createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
	);
