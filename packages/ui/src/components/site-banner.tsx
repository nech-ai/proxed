import * as React from "react";
import { cn } from "@proxed/ui/lib/utils";

interface SiteBannerProps {
	children: React.ReactNode;
	className?: string;
}

export function SiteBanner({ children, className }: SiteBannerProps) {
	return (
		<div
			role="status"
			className={cn(
				"border-b border-border bg-muted/80 px-4 py-2.5 text-center text-sm leading-5 text-foreground backdrop-blur-sm",
				className,
			)}
		>
			<p className="mx-auto max-w-3xl text-pretty">{children}</p>
		</div>
	);
}
