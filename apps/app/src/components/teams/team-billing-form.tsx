"use client";

import { Button } from "@proxed/ui/components/button";
import { PLANS, formatPrice, formatCostPerCall } from "@/utils/plans";
import { Tabs, TabsList, TabsTrigger } from "@proxed/ui/components/tabs";
import { Check, ChevronRight, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TeamCard } from "./team-card";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { Slider } from "@proxed/ui/components/slider";
import { useUserQuery } from "@/hooks/use-user";

export function TeamBillingForm() {
	const router = useRouter();
	const { data: user } = useUserQuery();
	const teamId = user?.teamId ?? user?.team?.id ?? null;

	const [isLoading, setIsLoading] = useState(false);
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"yearly",
	);
	const [sliderValue, setSliderValue] = useState(1); // 0: Starter, 1: Pro, 2: Ultimate

	const plans = ["starter", "pro", "ultimate"];
	const selectedPlan = `${plans[sliderValue]}-${billingCycle}`;

	const handleContinue = () => {
		if (!teamId) return;
		setIsLoading(true);

		// Redirect to checkout with the selected plan
		const checkoutUrl = `/api/checkout?plan=${selectedPlan}&teamId=${teamId}&planType=${plans[sliderValue]}`;
		router.push(checkoutUrl);
	};

	return (
		<TeamCard
			title="Choose a Plan"
			description="Select a plan that fits your needs to continue setting up your team"
		>
			<Alert className="mb-6 border-blue-500/20 bg-blue-500/10">
				<AlertCircle className="h-4 w-4 text-blue-600" />
				<AlertDescription className="text-sm">
					Your plan selection affects your API limits and available features.
					You can change your plan later.
				</AlertDescription>
			</Alert>

			<div className="space-y-8 w-full">
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

				{/* Plan Slider */}
				<div className="px-4 py-3">
					<div className="flex justify-between mb-3 px-2">
						<span className="text-sm font-medium">Starter</span>
						<span className="text-sm font-medium">Pro</span>
						<span className="text-sm font-medium">Ultimate</span>
					</div>
					<Slider
						defaultValue={[1]}
						min={0}
						max={2}
						step={1}
						value={[sliderValue]}
						onValueChange={(value) => setSliderValue(value[0])}
						className="cursor-pointer"
					/>
				</div>

				{/* Active Plan Details */}
				<div className="rounded-lg border border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
					<div className="p-6 relative">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-bold flex items-center">
								{
									PLANS.production[
										selectedPlan as keyof typeof PLANS.production
									].name
								}
								{sliderValue === 1 && (
									<span className="ml-3 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
										Popular
									</span>
								)}
							</h2>
							<div className="text-right">
								<div className="text-3xl font-bold">
									{formatPrice(
										PLANS.production[
											selectedPlan as keyof typeof PLANS.production
										].price,
									)}
									<span className="text-lg font-medium ml-1 text-muted-foreground">
										/{billingCycle === "monthly" ? "mo" : "yr"}
									</span>
								</div>
								<div className="text-xs text-muted-foreground mt-1">
									{formatCostPerCall(
										selectedPlan as
											| "starter-monthly"
											| "starter-yearly"
											| "pro-monthly"
											| "pro-yearly"
											| "ultimate-monthly"
											| "ultimate-yearly",
									)}{" "}
									per API call
								</div>
							</div>
						</div>

						<div className="space-y-6 mt-6">
							<div>
								<h3 className="text-sm font-semibold mb-3 flex items-center">
									<Zap className="h-4 w-4 mr-2 text-primary" />
									Features
								</h3>
								<ul className="space-y-2">
									<li className="flex items-start">
										<Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
										<span className="text-sm">
											{sliderValue === 0 ? "1 Project" : "Unlimited Projects"}
										</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
										<span className="text-sm">
											{PLANS.production[
												selectedPlan as keyof typeof PLANS.production
											].apiCalls.toLocaleString()}{" "}
											API calls per month
										</span>
									</li>
									<li className="flex items-start">
										<Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
										<span className="text-sm">DeviceCheck authentication</span>
									</li>
									{sliderValue >= 1 && (
										<li className="flex items-start">
											<Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
											<span className="text-sm">Advanced rate limiting</span>
										</li>
									)}
									{sliderValue >= 1 && (
										<li className="flex items-start">
											<Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
											<span className="text-sm">
												Real-Time Logs & Monitoring
											</span>
										</li>
									)}
									{sliderValue >= 2 && (
										<li className="flex items-start">
											<Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
											<span className="text-sm">
												Advanced analytics & cost monitoring
											</span>
										</li>
									)}
									{sliderValue >= 2 && (
										<li className="flex items-start">
											<Check className="h-4 w-4 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
											<span className="text-sm">Dedicated support & SLA</span>
										</li>
									)}
								</ul>
							</div>

							<div>
								<p className="text-sm text-muted-foreground mb-4">
									{sliderValue === 0 &&
										"Perfect for getting started with basic security needs."}
									{sliderValue === 1 &&
										"Ideal for growing apps that need more control and features."}
									{sliderValue === 2 &&
										"Enterprise-grade solution with maximum security and support."}
								</p>

								{sliderValue === 1 && (
									<div className="bg-green-50 dark:bg-green-900/20 rounded p-3 border border-green-200 dark:border-green-900/30">
										<p className="text-sm text-green-800 dark:text-green-400">
											{billingCycle === "yearly"
												? "Save 83% per call vs Starter"
												: "Save 75% per call vs Starter"}
										</p>
									</div>
								)}

								{sliderValue === 2 && (
									<div className="bg-green-50 dark:bg-green-900/20 rounded p-3 border border-green-200 dark:border-green-900/30">
										<p className="text-sm text-green-800 dark:text-green-400">
											{billingCycle === "yearly"
												? "Save 50% per call vs Pro"
												: "Save 40% per call vs Pro"}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="text-center pt-2 text-sm text-muted-foreground">
					All plans include email support. Prices exclude VAT.
				</div>

				<div className="pt-4 border-t">
					<div className="flex flex-col sm:flex-row gap-4">
						<Button
							type="button"
							onClick={handleContinue}
							disabled={isLoading || !teamId}
							className="w-full"
						>
							{isLoading ? (
								"Processing..."
							) : (
								<>
									Continue with{" "}
									{
										PLANS.production[
											selectedPlan as keyof typeof PLANS.production
										].name
									}
									<ChevronRight className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>

						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/")}
							className="w-full"
						>
							Start Free Trial
						</Button>
					</div>
				</div>
			</div>
		</TeamCard>
	);
}
