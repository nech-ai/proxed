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
					Ready to build your next AI wrapper?
				</p>
				<p className="max-w-3xl text-muted-foreground mb-6 text-balance mx-auto font-medium text-lg">
					Sign up now and secure your AI-powered iOS experience with
					proxed.ai—no fees during Beta.
				</p>

				<div className="flex justify-center">
					<Button className="flex items-center gap-2" onClick={openModal}>
						Get started in minutes!
					</Button>
				</div>
			</div>
		</Section>
	);
}
