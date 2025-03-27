"use client";

import { Section } from "@/components/section";
import { Button } from "@proxed/ui/components/button";
import { useSubscribeModal } from "@/context/subscribe-modal-context";

export function CTA() {
	const { openModal } = useSubscribeModal();

	return (
		<Section id="cta">
			<div className="overflow-hidden relative text-center py-16 mx-auto">
				<p className="max-w-3xl text-foreground mb-6 text-balance mx-auto font-medium text-3xl">
					Ready to secure your AI integration?
				</p>
				<p className="max-w-3xl text-muted-foreground mb-6 text-balance mx-auto font-medium text-lg">
					Start protecting your AI API keys in minutes—no engineers needed, no
					complex backend to build. Sign up during our Beta phase and lock in
					special pricing.
				</p>

				<div className="flex justify-center">
					<Button className="flex items-center gap-2" onClick={openModal}>
						Secure your AI keys now
					</Button>
				</div>
			</div>
		</Section>
	);
}
