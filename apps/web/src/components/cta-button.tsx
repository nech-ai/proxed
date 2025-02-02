"use client";

import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import { useSubscribeModal } from "@/context/subscribe-modal-context";
import { cn } from "@proxed/ui/utils";
import type { ComponentProps } from "react";

interface CtaButtonProps extends ComponentProps<typeof Button> {}

export function CtaButton({ className, ...props }: CtaButtonProps) {
	const { openModal } = useSubscribeModal();

	return (
		<Button
			variant="default"
			className={cn(
				"h-8 text-primary-foreground group tracking-tight font-medium",
				className,
			)}
			onClick={openModal}
			{...props}
		>
			{siteConfig.cta}
		</Button>
	);
}
