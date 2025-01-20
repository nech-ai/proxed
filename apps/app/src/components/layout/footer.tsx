"use client";

export function Footer() {
	return (
		<footer className="w-full p-4 text-center text-muted-foreground text-sm mt-auto flex items-center justify-center gap-4">
			<p>&copy; 2025 Proxed.AI. All rights reserved.</p>
			<a
				href="https://proxed.ai/terms"
				className="underline hover:text-foreground"
			>
				Terms & Conditions
			</a>
			<a
				href="https://proxed.ai/privacy"
				className="underline hover:text-foreground"
			>
				Privacy Policy
			</a>
		</footer>
	);
}
