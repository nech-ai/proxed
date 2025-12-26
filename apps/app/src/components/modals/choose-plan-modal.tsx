"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@proxed/ui/components/dialog";
import Link from "next/link";
import { Button } from "@proxed/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@proxed/ui/components/tabs";
import { RadioGroup, RadioGroupItem } from "@proxed/ui/components/radio-group";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { PLANS, formatPrice } from "@/utils/plans";
import { Label } from "@proxed/ui/components/label";
import { useBillingQuery } from "@/hooks/use-billing";
import { useUserQuery } from "@/hooks/use-user";

export function ChoosePlanModal({
	isOpen,
	onOpenChange,
	daysLeft,
}: {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	daysLeft?: number;
}) {
	const { data: user } = useUserQuery();
	const { canChooseStarterPlan } = useBillingQuery();
	const teamId = user?.teamId ?? user?.team?.id ?? null;
	const [isLoading, setIsLoading] = useState(false);
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"yearly",
	);
	const [selectedPlan, setSelectedPlan] = useState<
		"starter" | "pro" | "ultimate"
	>("pro");

	const planId = `${selectedPlan}-${billingCycle}`;

	const getTitle = () => {
		if (daysLeft && daysLeft > 0) {
			return `Free trial • ${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining`;
		}
		return "Select your plan";
	};

	const getDescription = () => {
		if (daysLeft !== undefined) {
			if (daysLeft > 0) {
				return `Enjoy full access for ${daysLeft} more ${daysLeft === 1 ? "day" : "days"}. After that, you'll need a plan to continue using all features.`;
			}
			return "Your trial has ended. Select a plan to regain full access to all Proxed features.";
		}
		return "Select the plan that best fits your needs to get the most out of Proxed.";
	};

	const handleContinue = () => {
		if (!teamId) return;
		setIsLoading(true);
		window.location.href = `/api/checkout?plan=${planId}&teamId=${teamId}`;
	};

	if (!teamId) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{getTitle()}</DialogTitle>
					<DialogDescription>{getDescription()}</DialogDescription>
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
								id="modal-starter"
								className="peer sr-only"
								disabled={!canChooseStarterPlan}
							/>
							<Label
								htmlFor="modal-starter"
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
								id="modal-pro"
								className="peer sr-only"
							/>
							<Label
								htmlFor="modal-pro"
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
								id="modal-ultimate"
								className="peer sr-only"
							/>
							<Label
								htmlFor="modal-ultimate"
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
						All plans include premium support. Prices shown exclude VAT.
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
