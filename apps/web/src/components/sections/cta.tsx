"use client";

import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import Link from "next/link";

export function CTA() {
	return (
		<Section id="cta">
			<div className="overflow-hidden relative text-center py-16 mx-auto">
				<p className="max-w-3xl text-foreground mb-6 text-balance mx-auto font-medium text-3xl">
					Start Your Free Trial—No Credit Card Needed
				</p>
				<p className="max-w-3xl text-muted-foreground mb-6 text-balance mx-auto font-medium text-lg">
					Secure your AI integration in minutes. Swap your endpoint, ship, and
					decide later—first 14&nbsp;days are on us.
				</p>

				<div className="flex justify-center">
					<Button asChild className="flex items-center gap-2">
						<Link href="https://app.proxed.ai/signup">{siteConfig.cta}</Link>
					</Button>
				</div>
			</div>
		</Section>
	);
}
