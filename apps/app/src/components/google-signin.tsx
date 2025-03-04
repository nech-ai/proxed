"use client";

import { createClient } from "@proxed/supabase/client";
import { Button } from "@proxed/ui/components/button";

export function GoogleSignin() {
	const supabase = createClient();

	const handleSignin = () => {
		supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/api/auth/callback`,
			},
		});
	};

	return (
		<Button onClick={handleSignin} variant="outline" className="font-mono">
			Sign in with Google
		</Button>
	);
}
