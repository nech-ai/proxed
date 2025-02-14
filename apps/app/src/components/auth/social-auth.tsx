"use client";

import { createClient } from "@proxed/supabase/client";
import { Button } from "@proxed/ui/components/button";
import { cn } from "@proxed/ui/utils";
import { useSearchParams } from "next/navigation";

interface SocialAuthProps {
	className?: string;
}

export function SocialAuth({ className }: SocialAuthProps) {
	const supabase = createClient();
	const searchParams = useSearchParams();

	const invitationCode = searchParams.get("invitationCode");
	const redirectTo = invitationCode
		? `/api/team/invitation/${invitationCode}`
		: (searchParams.get("redirectTo") ?? "/");

	const handleGoogleSignin = () => {
		const redirectSearchParams = new URLSearchParams();
		redirectSearchParams.set("provider", "google");
		redirectSearchParams.set("redirectTo", redirectTo);
		if (invitationCode) {
			redirectSearchParams.set("invitationCode", invitationCode);
		}

		supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/api/auth/callback?${redirectSearchParams.toString()}`,
			},
		});
	};

	return (
		<div className={cn("flex w-full flex-col gap-2", className)}>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>

			<Button
				variant="outline"
				type="button"
				onClick={handleGoogleSignin}
				className="font-mono"
			>
				<svg
					className="mr-2 size-4"
					aria-hidden="true"
					focusable="false"
					data-prefix="fab"
					data-icon="google"
					role="img"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 488 512"
				>
					<path
						fill="currentColor"
						d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
					/>
				</svg>
				Continue with Google
			</Button>
		</div>
	);
}
