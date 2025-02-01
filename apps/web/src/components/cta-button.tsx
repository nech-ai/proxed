"use client";

import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import { useQueryState, parseAsBoolean } from "nuqs";

export function CtaButton() {
	const [_, setIsModalOpen] = useQueryState("dialog", parseAsBoolean);

	return (
		<Button
			variant="default"
			className="h-8 text-primary-foreground group tracking-tight font-medium"
			onClick={() => setIsModalOpen(true)}
		>
			{siteConfig.cta}
		</Button>
	);
}
