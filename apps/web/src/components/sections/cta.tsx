"use client";

import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import {
	SITE_COPY,
	getAppAuthUrl,
	getAuthCtaLabel,
	isRegistrationEnabled,
} from "@proxed/utils/lib/site";
import Link from "next/link";

export function CTA() {
	const registrationOpen = isRegistrationEnabled();

	return (
		<Section id="cta">
			<div className="overflow-hidden relative text-center py-16 mx-auto">
				<p className="max-w-3xl text-foreground mb-6 text-balance mx-auto font-medium text-3xl">
					{registrationOpen
						? "Start Your Free Trial—No Credit Card Needed"
						: SITE_COPY.marketingCtaTitle}
				</p>
				<p className="max-w-3xl text-muted-foreground mb-6 text-balance mx-auto font-medium text-lg">
					{registrationOpen
						? "Secure your AI integration in minutes. Swap your endpoint, ship, and decide later—first 14 days are on us."
						: SITE_COPY.marketingCtaDescription}
				</p>

				<div className="flex justify-center">
					<Button asChild className="flex items-center gap-2">
						<Link href={getAppAuthUrl()}>
							{getAuthCtaLabel(siteConfig.cta)}
						</Link>
					</Button>
				</div>
			</div>
		</Section>
	);
}
