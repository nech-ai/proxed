"use client";

import { createClient } from "@proxed/supabase/client";
import { Button } from "@proxed/ui/components/button";
import { LogOutIcon } from "lucide-react";
import { redirect } from "next/navigation";

export function SignOut() {
	const supabase = createClient();

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		redirect("/login");
	};

	return (
		<Button
			onClick={handleSignOut}
			variant="outline"
			className="flex items-center gap-2 font-mono"
		>
			<LogOutIcon className="size-4" />
			<span>Sign out</span>
		</Button>
	);
}
