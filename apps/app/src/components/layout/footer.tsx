"use client";

export function Footer() {
	return (
		<footer className="w-full p-4 text-center text-muted-foreground text-sm mt-auto flex items-center justify-center gap-4">
			<p className="hidden md:block">
				&copy; 2025 Proxed.AI. All rights reserved.
			</p>
			<a href="https://proxed.ai/legal/terms" className="hover:text-foreground">
				Terms & Conditions
			</a>
			<a
				href="https://proxed.ai/legal/privacy"
				className="hover:text-foreground"
			>
				Privacy Policy
			</a>
			<a href="https://status.proxed.ai" className="hover:text-foreground">
				Status
			</a>
		</footer>
	);
}
