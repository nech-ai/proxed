"use client";

import { trackingConsentAction } from "@/actions/tracking-consent-action";
import { Button } from "@proxed/ui/components/button";
import { cn } from "@proxed/ui/utils";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export function ConsentBanner() {
	const [isOpen, setOpen] = useState(true);
	const trackingAction = useAction(trackingConsentAction, {
		onExecute: () => setOpen(false),
	});

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className={cn(
				"fixed z-50 bottom-4 left-1/2 -translate-x-1/2 flex flex-col space-y-4 w-[calc(100vw-32px)] max-w-[420px] border border-border/40 p-6 transition-all bg-background/80 backdrop-blur-lg rounded-lg shadow-lg",
				isOpen && "animate-in fade-in-0 slide-in-from-bottom-8 duration-500",
			)}
		>
			<div className="text-sm text-muted-foreground leading-relaxed">
				proxed.ai uses tracking technologies. You may opt in or opt out of the
				use of these technologies.
			</div>
			<div className="flex justify-end space-x-3">
				<Button
					variant="outline"
					size="sm"
					className="rounded-full"
					onClick={() => trackingAction.execute(false)}
				>
					Deny
				</Button>
				<Button
					size="sm"
					className="rounded-full"
					onClick={() => trackingAction.execute(true)}
				>
					Accept
				</Button>
			</div>
		</div>
	);
}
