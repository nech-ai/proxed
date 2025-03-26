"use client";

import { cn } from "@proxed/ui/utils";
import { Button } from "@proxed/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@proxed/ui/components/tabs";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PLANS, formatPrice } from "@/utils/plans";

export function Plans({
	teamId,
	canChooseStarterPlan,
}: {
	teamId: string;
	canChooseStarterPlan: boolean;
}) {
	const [isLoading, setIsLoading] = useState(0);
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"yearly",
	);

	return (
		<div className="space-y-6 w-full">
			<div className="flex justify-center">
				<Tabs
					defaultValue="yearly"
					onValueChange={(value) =>
						setBillingCycle(value as "monthly" | "yearly")
					}
				>
					<TabsList>
						<TabsTrigger value="monthly">Monthly</TabsTrigger>
						<TabsTrigger value="yearly">
							Yearly{" "}
							<span className="ml-1 text-xs text-green-500">(Save 25%)</span>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-7 w-full">
				{/* Starter Plan */}
				<div className="flex flex-col p-6 border bg-background">
					<h2 className="text-xl mb-2 text-left">Starter</h2>
					<div className="mt-1 flex items-baseline">
						<span className="text-2xl font-medium tracking-tight">
							{formatPrice(PLANS.production[`starter-${billingCycle}`].price)}
						</span>
						<span className="ml-1 text-base font-medium">
							/{billingCycle === "monthly" ? "mo" : "yr"}
						</span>
						<span className="ml-2 text-xs text-muted-foreground">
							Excl. VAT
						</span>
					</div>

					<div className="mt-4">
						<h3 className="text-xs font-medium uppercase tracking-wide text-left text-[#878787] font-mono">
							INCLUDING
						</h3>
						<ul className="mt-4 space-y-2">
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">1 Project</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">5,000 API calls per month</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">DeviceCheck authentication</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">Real-time monitoring</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">Basic analytics</span>
							</li>
						</ul>
					</div>

					<div className="mt-auto border-t-[1px] border-border pt-4">
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										href={`/api/checkout?plan=starter-${billingCycle}&teamId=${teamId}`}
										className={cn(
											!canChooseStarterPlan && "opacity-50 cursor-default",
										)}
										onClick={(evt) => {
											if (!canChooseStarterPlan) {
												evt.preventDefault();
												return;
											}

											setIsLoading(1);
										}}
									>
										<Button
											variant="secondary"
											className={cn(
												"h-9 hover:bg-primary hover:text-secondary",
												!canChooseStarterPlan && "pointer-events-none",
											)}
											disabled={isLoading === 1}
										>
											Choose starter plan
										</Button>
									</Link>
								</TooltipTrigger>
								{!canChooseStarterPlan && (
									<TooltipContent className="text-xs max-w-[300px]">
										<p>
											This plan is not applicable since you have exceeded the
											limits for this subscription.
										</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>

				{/* Pro Plan */}
				<div className="flex flex-col p-6 border border-primary bg-background relative">
					<div className="absolute top-3 right-3 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
						Popular
					</div>
					<h2 className="text-xl text-left mb-2">Pro</h2>
					<div className="mt-1 flex items-baseline">
						<span className="text-2xl font-medium tracking-tight">
							{formatPrice(PLANS.production[`pro-${billingCycle}`].price)}
						</span>
						<span className="ml-1 text-base font-medium">
							/{billingCycle === "monthly" ? "mo" : "yr"}
						</span>
						<span className="ml-2 text-xs text-muted-foreground">
							Excl. VAT
						</span>
					</div>

					<div className="mt-4">
						<h3 className="text-xs font-medium uppercase tracking-wide text-left text-[#878787] font-mono">
							INCLUDING
						</h3>
						<ul className="mt-4 space-y-2">
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">Unlimited Projects</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">10,000 API calls per month</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">DeviceCheck authentication</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">Advanced rate limiting</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">Real-Time Logs & Monitoring</span>
							</li>
						</ul>
					</div>

					<div className="mt-auto border-t border-border pt-4">
						<Link
							href={`/api/checkout?plan=pro-${billingCycle}&teamId=${teamId}`}
						>
							<Button
								variant="default"
								className="h-9 w-full"
								onClick={() => setIsLoading(2)}
								disabled={isLoading === 2}
							>
								Choose pro plan
							</Button>
						</Link>
					</div>
				</div>

				{/* Ultimate Plan */}
				<div className="flex flex-col p-6 border bg-background">
					<h2 className="text-xl text-left mb-2">Ultimate</h2>
					<div className="mt-1 flex items-baseline">
						<span className="text-2xl font-medium tracking-tight">
							{formatPrice(PLANS.production[`ultimate-${billingCycle}`].price)}
						</span>
						<span className="ml-1 text-base font-medium">
							/{billingCycle === "monthly" ? "mo" : "yr"}
						</span>
						<span className="ml-2 text-xs text-muted-foreground">
							Excl. VAT
						</span>
					</div>

					<div className="mt-4">
						<h3 className="text-xs font-medium uppercase tracking-wide text-left text-[#878787] font-mono">
							INCLUDING
						</h3>
						<ul className="mt-4 space-y-2">
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">Unlimited Projects</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">50,000 API calls per month</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">DeviceCheck authentication</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">
									Advanced analytics & cost monitoring
								</span>
							</li>
							<li className="flex items-start">
								<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
								<span className="text-xs">Dedicated support & SLA</span>
							</li>
						</ul>
					</div>

					<div className="mt-auto border-t border-border pt-4">
						<Link
							href={`/api/checkout?plan=ultimate-${billingCycle}&teamId=${teamId}`}
						>
							<Button
								variant="secondary"
								className="h-9 w-full hover:bg-primary hover:text-secondary"
								onClick={() => setIsLoading(3)}
								disabled={isLoading === 3}
							>
								Choose ultimate plan
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<div className="text-center pt-4">
				<p className="text-sm">
					All plans include email support. Prices exclude VAT.
				</p>
				<p className="text-sm text-muted-foreground">
					Need a custom plan?{" "}
					<a href="mailto:alex@proxed.ai" className="text-primary underline">
						Contact us
					</a>
				</p>
			</div>
		</div>
	);
}
