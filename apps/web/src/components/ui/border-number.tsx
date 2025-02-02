import type React from "react";
import { forwardRef } from "react";

import { cn } from "@proxed/ui/utils";

interface BorderTextProps extends React.HTMLAttributes<HTMLDivElement> {
	text: string;
}

export const BorderText = forwardRef<HTMLDivElement, BorderTextProps>(
	({ text, className, ...props }, ref) => {
		return (
			<div className="flex items-center justify-center">
				<span
					ref={ref}
					style={{ "--text": `'${text}'` } as React.CSSProperties}
					className={cn(
						"relative font-mono pointer-events-none text-center text-[6rem] font-bold leading-none",
						// Deeper inset effect with stronger gradient
						"before:bg-gradient-to-b before:from-neutral-700/35 before:to-neutral-600/25 dark:before:from-neutral-600/35 dark:before:to-neutral-700/25",
						"before:to-80% before:bg-clip-text before:text-transparent before:content-[var(--text)]",
						// Stronger inner shadow
						"after:absolute after:inset-0 after:bg-neutral-700/35 dark:after:bg-neutral-600/35",
						"after:bg-clip-text after:text-transparent after:mix-blend-darken dark:after:mix-blend-lighten",
						"after:content-[var(--text)]",
						// Enhanced inset shadows
						"[text-shadow:inset_0_3px_6px_rgba(0,0,0,0.4),_0_-1px_2px_rgba(255,255,255,0.1)]",
						"after:[text-shadow:inset_0_4px_8px_rgba(0,0,0,0.4),_0_-2px_3px_rgba(255,255,255,0.15)] dark:after:[text-shadow:inset_0_4px_8px_rgba(0,0,0,0.5),_0_-2px_3px_rgba(0,0,0,0.3)]",
						className,
					)}
					{...props}
				/>
			</div>
		);
	},
);

BorderText.displayName = "BorderText";
