import { cn } from "@proxed/ui/utils";
import type React from "react";

interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
	className?: string;
}

export function GradientText({
	as: Component = "span",
	className,
	...props
}: GradientTextProps) {
	return (
		<Component
			className={cn(
				"bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent",
				className,
			)}
			{...props}
		/>
	);
}
