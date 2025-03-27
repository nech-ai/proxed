"use client";

import { ActionBlock } from "@/components/shared/action-block";
import { Card } from "@proxed/ui/components/card";
import { Button } from "@proxed/ui/components/button";
import { Badge } from "@proxed/ui/components/badge";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PLANS } from "@/utils/plans";

interface ManageSubscriptionProps {
	teamId: string;
	plan: string | null;
	email?: string;
	canceled_at?: string | null;
}

export function ManageSubscription({
	teamId,
	plan,
	email,
	canceled_at,
}: ManageSubscriptionProps) {
	const [isLoading, setIsLoading] = useState(false);

	const planName = plan?.split("-")[0].toUpperCase() ?? "FREE";
	const billingCycle = plan?.split("-")[1] ?? "MONTHLY";
	const planDetails = plan
		? PLANS.production[plan as keyof typeof PLANS.production]
		: null;

	const planBenefits = {
		starter: [
			"1 Project",
			"1,000 API calls per month",
			"DeviceCheck authentication",
			"Real-time monitoring",
			"Basic analytics",
		],
		pro: [
			"Unlimited Projects",
			"10,000 API calls per month",
			"DeviceCheck authentication",
			"Advanced rate limiting",
			"Real-Time Logs & Monitoring",
		],
		ultimate: [
			"Unlimited Projects",
			"50,000 API calls per month",
			"DeviceCheck authentication",
			"Advanced analytics & cost monitoring",
			"Dedicated support & SLA",
		],
	};

	const currentBenefits =
		planBenefits[planName.toLowerCase() as keyof typeof planBenefits] ?? [];

	return (
		<ActionBlock title="Subscription">
			<Card className="p-6">
				<div className="flex flex-col gap-6">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-medium">{planName}</h3>
								{canceled_at && (
									<Badge variant="destructive">
										Cancels on {new Date(canceled_at).toLocaleDateString()}
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								Billed {billingCycle.toLowerCase()}
								{email && ` • ${email}`}
							</p>
							{planDetails && (
								<p className="text-sm font-medium mt-2">
									{planDetails.price > 0 ? (
										<>
											${planDetails.price} /{" "}
											{billingCycle.toLowerCase() === "monthly" ? "mo" : "yr"}
											<span className="text-xs text-muted-foreground ml-1">
												Excl. VAT
											</span>
										</>
									) : (
										"Free Plan"
									)}
								</p>
							)}
						</div>

						<Link
							href={`/api/portal?id=${teamId}`}
							onClick={() => setIsLoading(true)}
						>
							<Button variant="outline" className="h-9" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Loading...
									</>
								) : (
									"Manage subscription"
								)}
							</Button>
						</Link>
					</div>

					{currentBenefits.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Your Plan Includes
							</h4>
							<ul className="space-y-2">
								{currentBenefits.map((benefit, index) => (
									<li key={index} className="flex items-start">
										<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
										<span className="text-xs">{benefit}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					<div className="text-sm text-muted-foreground">
						<p>
							Need help with your subscription?{" "}
							<a
								href="mailto:alex@proxed.ai"
								className="text-primary hover:underline"
							>
								Contact support
							</a>
						</p>
					</div>
				</div>
			</Card>
		</ActionBlock>
	);
}
