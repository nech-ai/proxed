import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../types";

const conWarn = console.warn;
const conLog = console.log;

const IGNORE_WARNINGS = [
	"Using the user object as returned from supabase.auth.getSession()",
];

console.warn = (...args) => {
	const match = args.find((arg) =>
		typeof arg === "string"
			? IGNORE_WARNINGS.find((warning) => arg.includes(warning))
			: false,
	);
	if (!match) {
		conWarn(...args);
	}
};

console.log = (...args) => {
	const match = args.find((arg) =>
		typeof arg === "string"
			? IGNORE_WARNINGS.find((warning) => arg.includes(warning))
			: false,
	);
	if (!match) {
		conLog(...args);
	}
};

export const createClient = async () => {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch (error) {}
				},
			},
		},
	);
};
