"use server";

import { getSession } from "@proxed/supabase/cached-queries";
import { createClient } from "@proxed/supabase/server";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function signOutAction() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await getSession();

	await supabase.auth.signOut({
		scope: "local",
	});

	revalidateTag(`user_${session?.user.id}`);

	return redirect("/login");
}
