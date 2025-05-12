"use client";

import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import Link from "next/link";
import { cn } from "@proxed/ui/utils";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface CtaButtonProps extends Omit<ButtonProps, "variant"> {
	variant?: ButtonProps["variant"];
}

const CTA_BUTTON_CLASSES =
	"h-8 text-primary-foreground group tracking-tight font-medium";

export function CtaButton({
	className,
	variant = "default",
	...props
}: CtaButtonProps) {
	return (
		<Button
			asChild
			variant={variant}
			className={cn(CTA_BUTTON_CLASSES, className)}
			{...props}
		>
			<Link href="https://app.proxed.ai/signup">{siteConfig.cta}</Link>
		</Button>
	);
}
