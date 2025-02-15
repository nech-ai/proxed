"use client";

import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import { useSubscribeModal } from "@/context/subscribe-modal-context";
import { cn } from "@proxed/ui/utils";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface CtaButtonProps extends Omit<ButtonProps, "onClick" | "variant"> {
	variant?: ButtonProps["variant"];
}

const CTA_BUTTON_CLASSES =
	"h-8 text-primary-foreground group tracking-tight font-medium";

export function CtaButton({
	className,
	variant = "default",
	...props
}: CtaButtonProps) {
	const { openModal } = useSubscribeModal();

	return (
		<Button
			variant={variant}
			className={cn(CTA_BUTTON_CLASSES, className)}
			onClick={openModal}
			{...props}
		>
			{siteConfig.cta}
		</Button>
	);
}
