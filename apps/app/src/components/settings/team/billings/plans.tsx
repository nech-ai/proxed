"use client";

import { ActionBlock } from "@/components/shared/action-block";
import { cn } from "@proxed/ui/utils";
import { Button } from "@proxed/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@proxed/ui/components/tabs";
import { Card } from "@proxed/ui/components/card";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PLANS, formatPrice, formatCostPerCall } from "@/utils/plans";
import { useUserQuery } from "@/hooks/use-user";
import { useBillingQuery } from "@/hooks/use-billing";

export function Plans() {
	const [isLoading, setIsLoading] = useState(0);
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"yearly",
	);
	const { plan, canChooseStarterPlan } = useBillingQuery();
	const { data: user } = useUserQuery();
	const teamId = user?.teamId ?? user?.team?.id ?? null;

	if (!teamId || plan !== "trial") {
		return null;
	}

	return (
		<ActionBlock title="Available Plans">
			<div className="space-y-6">
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

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Starter Plan */}
					<Card className="p-6 relative">
						<div className="space-y-4">
							<div>
								<h3 className="text-xl font-medium">Starter</h3>
								<div className="mt-1 flex items-baseline">
									<span className="text-2xl font-medium tracking-tight">
										{formatPrice(
											PLANS.production[`starter-${billingCycle}`].price,
										)}
									</span>
									<span className="ml-1 text-base font-medium">
										/{billingCycle === "monthly" ? "mo" : "yr"}
									</span>
									<span className="ml-2 text-xs text-muted-foreground">
										Excl. VAT
									</span>
								</div>
								<div className="mt-1">
									<span className="text-xs text-muted-foreground">
										({formatCostPerCall(`starter-${billingCycle}`)} per API
										call)
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Including
								</h4>
								<ul className="space-y-2">
									<li className="flex items-start">
										<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
										<span className="text-xs">1 Project</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
										<span className="text-xs">
											{PLANS.production[
												`starter-${billingCycle}`
											].apiCalls.toLocaleString()}{" "}
											API calls per month
										</span>
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

							<div className="pt-4 mt-auto">
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
													variant="outline"
													className="w-full"
													disabled={isLoading === 1 || !canChooseStarterPlan}
												>
													{isLoading === 1 ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Processing...
														</>
													) : (
														"Choose starter plan"
													)}
												</Button>
											</Link>
										</TooltipTrigger>
										{!canChooseStarterPlan && (
											<TooltipContent className="text-xs max-w-[300px]">
												<p>
													This plan is not applicable since you have exceeded
													the limits for this subscription.
												</p>
											</TooltipContent>
										)}
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					</Card>

					{/* Pro Plan */}
					<Card className="p-6 relative border-primary">
						<div className="absolute top-3 right-3 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
							Popular
						</div>
						<div className="space-y-4">
							<div>
								<h3 className="text-xl font-medium">Pro</h3>
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
								<div className="mt-1">
									<span className="text-xs text-muted-foreground">
										({formatCostPerCall(`pro-${billingCycle}`)} per API call)
									</span>
									<span className="ml-1 text-xs text-green-500">
										{billingCycle === "yearly"
											? "Save 83% per call vs Starter"
											: "Save 75% per call vs Starter"}
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Including
								</h4>
								<ul className="space-y-2">
									<li className="flex items-start">
										<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
										<span className="text-xs">Unlimited Projects</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
										<span className="text-xs">
											{PLANS.production[
												`pro-${billingCycle}`
											].apiCalls.toLocaleString()}{" "}
											API calls per month
										</span>
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

							<div className="pt-4 mt-auto">
								<Link
									href={`/api/checkout?plan=pro-${billingCycle}&teamId=${teamId}`}
								>
									<Button
										className="w-full"
										onClick={() => setIsLoading(2)}
										disabled={isLoading === 2}
									>
										{isLoading === 2 ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Processing...
											</>
										) : (
											"Choose pro plan"
										)}
									</Button>
								</Link>
							</div>
						</div>
					</Card>

					{/* Ultimate Plan */}
					<Card className="p-6 relative">
						<div className="space-y-4">
							<div>
								<h3 className="text-xl font-medium">Ultimate</h3>
								<div className="mt-1 flex items-baseline">
									<span className="text-2xl font-medium tracking-tight">
										{formatPrice(
											PLANS.production[`ultimate-${billingCycle}`].price,
										)}
									</span>
									<span className="ml-1 text-base font-medium">
										/{billingCycle === "monthly" ? "mo" : "yr"}
									</span>
									<span className="ml-2 text-xs text-muted-foreground">
										Excl. VAT
									</span>
								</div>
								<div className="mt-1">
									<span className="text-xs text-muted-foreground">
										({formatCostPerCall(`ultimate-${billingCycle}`)} per API
										call)
									</span>
									<span className="ml-1 text-xs text-green-500">
										{billingCycle === "yearly"
											? "Save 50% per call vs Pro"
											: "Save 40% per call vs Pro"}
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Including
								</h4>
								<ul className="space-y-2">
									<li className="flex items-start">
										<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
										<span className="text-xs">Unlimited Projects</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
										<span className="text-xs">
											{PLANS.production[
												`ultimate-${billingCycle}`
											].apiCalls.toLocaleString()}{" "}
											API calls per month
										</span>
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

							<div className="pt-4 mt-auto">
								<Link
									href={`/api/checkout?plan=ultimate-${billingCycle}&teamId=${teamId}`}
								>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => setIsLoading(3)}
										disabled={isLoading === 3}
									>
										{isLoading === 3 ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Processing...
											</>
										) : (
											"Choose ultimate plan"
										)}
									</Button>
								</Link>
							</div>
						</div>
					</Card>
				</div>

				<div className="text-center pt-4">
					<p className="text-sm text-muted-foreground">
						All plans include email support. Prices exclude VAT.
					</p>
					<p className="text-sm text-muted-foreground">
						Need a custom plan?{" "}
						<a
							href="mailto:alex@proxed.ai"
							className="text-primary hover:underline"
						>
							Contact us
						</a>
					</p>
				</div>
			</div>
		</ActionBlock>
	);
}
