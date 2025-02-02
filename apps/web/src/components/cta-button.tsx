"use client";

import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import { useSubscribeModal } from "@/context/subscribe-modal-context";

export function CtaButton() {
	const { openModal } = useSubscribeModal();

	return (
		<Button
			variant="default"
			className="h-8 text-primary-foreground group tracking-tight font-medium"
			onClick={openModal}
		>
			{siteConfig.cta}
		</Button>
	);
}
