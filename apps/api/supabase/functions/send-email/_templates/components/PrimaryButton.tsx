import { Button } from "npm:@react-email/components@0.0.22";
import type { PropsWithChildren } from "npm:react@18.3.1";
import * as React from "npm:react@18.3.1";

export default function PrimaryButton({
	href,
	children,
}: PropsWithChildren<{
	href: string;
}>) {
	return (
		<Button
			href={href}
			className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
		>
			{children}
		</Button>
	);
}
