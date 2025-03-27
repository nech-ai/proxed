"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@proxed/ui/components/dialog";
import { differenceInDays } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@proxed/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@proxed/ui/components/tabs";
import { RadioGroup, RadioGroupItem } from "@proxed/ui/components/radio-group";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { PLANS, formatPrice } from "@/utils/plans";
import { Label } from "@proxed/ui/components/label";

interface TrialEndedBannerProps {
	createdAt: string;
	plan: string;
	teamId: string;
	canChooseStarterPlan: boolean;
}

export function TrialEndedModal({
	createdAt,
	plan,
	teamId,
	canChooseStarterPlan,
}: TrialEndedBannerProps) {
	const pathname = usePathname();
	const daysFromCreation = differenceInDays(new Date(), new Date(createdAt));
	const isFourteenDaysFromCreation = daysFromCreation >= 14;
	const [isLoading, setIsLoading] = useState(false);
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"yearly",
	);
	const [selectedPlan, setSelectedPlan] = useState<
		"starter" | "pro" | "ultimate"
	>("pro");

	const planId = `${selectedPlan}-${billingCycle}`;

	// Show modal if:
	// 1. On trial plan AND created more than 14 days ago AND date is 2025-04-15 or later
	// OR
	// 2. On trial plan AND created after 2025-03-01 AND it's been 14 days or more since creation
	const showModal = plan === "trial" && isFourteenDaysFromCreation;

	if (
		pathname.includes("/settings") ||
		pathname.includes("/support") ||
		!showModal
	) {
		return null;
	}

	const handleContinue = () => {
		setIsLoading(true);
		window.location.href = `/api/checkout?plan=${planId}&teamId=${teamId}`;
	};

	return (
		<Dialog open={true} onOpenChange={() => {}}>
			<DialogContent className="max-w-[500px]" hideClose>
				<DialogHeader>
					<DialogTitle>Your Free trial has ended</DialogTitle>
					<DialogDescription>
						Select a plan below to regain full access to all Proxed features and
						continue your work.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 pt-3">
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
									<span className="ml-1 text-xs text-green-500">
										(Save 25%)
									</span>
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					<RadioGroup
						defaultValue="pro"
						onValueChange={(value) =>
							setSelectedPlan(value as "starter" | "pro" | "ultimate")
						}
						className="grid gap-3"
					>
						{/* Starter Plan */}
						<div>
							<RadioGroupItem
								value="starter"
								id="modal-starter-end"
								className="peer sr-only"
								disabled={!canChooseStarterPlan}
							/>
							<Label
								htmlFor="modal-starter-end"
								className="flex items-center justify-between p-3 border rounded-md peer-data-[state=checked]:border-primary cursor-pointer peer-disabled:opacity-60 peer-disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
							>
								<div className="flex flex-col">
									<span className="font-medium">Starter</span>
									<span className="text-xs text-muted-foreground">
										{PLANS.production[
											`starter-${billingCycle}`
										].apiCalls.toLocaleString()}{" "}
										API calls/month
									</span>
								</div>
								<div className="text-right">
									<div className="font-medium">
										{formatPrice(
											PLANS.production[`starter-${billingCycle}`].price,
										)}
										<span className="text-xs text-muted-foreground ml-1">
											/{billingCycle === "monthly" ? "mo" : "yr"}
										</span>
									</div>
								</div>
							</Label>
						</div>

						{/* Pro Plan */}
						<div>
							<RadioGroupItem
								value="pro"
								id="modal-pro-end"
								className="peer sr-only"
							/>
							<Label
								htmlFor="modal-pro-end"
								className="flex items-center justify-between p-3 border rounded-md peer-data-[state=checked]:border-primary cursor-pointer relative hover:bg-muted/50 transition-colors"
							>
								<div className="flex flex-col">
									<span className="font-medium">Pro</span>
									<span className="text-xs text-muted-foreground">
										{PLANS.production[
											`pro-${billingCycle}`
										].apiCalls.toLocaleString()}{" "}
										API calls/month
									</span>
								</div>
								<div className="text-right">
									<div className="font-medium">
										{formatPrice(PLANS.production[`pro-${billingCycle}`].price)}
										<span className="text-xs text-muted-foreground ml-1">
											/{billingCycle === "monthly" ? "mo" : "yr"}
										</span>
									</div>
								</div>
							</Label>
						</div>

						{/* Ultimate Plan */}
						<div>
							<RadioGroupItem
								value="ultimate"
								id="modal-ultimate-end"
								className="peer sr-only"
							/>
							<Label
								htmlFor="modal-ultimate-end"
								className="flex items-center justify-between p-3 border rounded-md peer-data-[state=checked]:border-primary cursor-pointer hover:bg-muted/50 transition-colors"
							>
								<div className="flex flex-col">
									<span className="font-medium">Ultimate</span>
									<span className="text-xs text-muted-foreground">
										{PLANS.production[
											`ultimate-${billingCycle}`
										].apiCalls.toLocaleString()}{" "}
										API calls/month
									</span>
								</div>
								<div className="text-right">
									<div className="font-medium">
										{formatPrice(
											PLANS.production[`ultimate-${billingCycle}`].price,
										)}
										<span className="text-xs text-muted-foreground ml-1">
											/{billingCycle === "monthly" ? "mo" : "yr"}
										</span>
									</div>
								</div>
							</Label>
						</div>
					</RadioGroup>

					<div className="pt-2">
						<Button
							className="w-full"
							onClick={handleContinue}
							disabled={
								isLoading ||
								(selectedPlan === "starter" && !canChooseStarterPlan)
							}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								<>
									Get started with{" "}
									{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
								</>
							)}
						</Button>
					</div>

					<p className="text-xs text-muted-foreground text-center">
						All plans include premium support. Visit{" "}
						<Link
							href="/settings/team/billing"
							className="underline hover:text-primary"
						>
							Settings
						</Link>{" "}
						to manage your subscription.
						<br />
						<Link
							href="/settings/team/billing"
							className="underline hover:text-primary"
						>
							View detailed plan comparison
						</Link>
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
