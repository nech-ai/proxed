"use client";

import { Section } from "@/components/section";
import { Button } from "@proxed/ui/components/button";
import { CardContent, CardHeader, CardTitle } from "@proxed/ui/components/card";
import { siteConfig } from "@/lib/config";
import { cn } from "@proxed/ui/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { useSubscribeModal } from "@/context/subscribe-modal-context";
import { GradientText } from "../gradient-text";
import { Icons } from "@/components/icons";

// Define the cost per call for each plan
const COST_PER_CALL = {
	monthly: {
		starter: "$0.0025",
		pro: "$0.0010",
		ultimate: "$0.0006",
	},
	yearly: {
		starter: "$0.0021",
		pro: "$0.0008",
		ultimate: "$0.0005",
	},
};

interface TabsProps {
	activeTab: string;
	setActiveTab: (tab: "yearly" | "monthly") => void;
	className?: string;
	children: (activeTab: string) => React.ReactNode;
}

interface TabsListProps {
	children: React.ReactNode;
}

interface TabsTriggerProps {
	value: string;
	onClick: () => void;
	children: React.ReactNode;
	isActive: boolean;
}

const Tabs = ({ activeTab, className, children }: TabsProps) => {
	return (
		<div
			className={cn(
				"mx-auto flex w-full items-center justify-center",
				className,
			)}
		>
			{children(activeTab)}
		</div>
	);
};

const TabsList = ({ children }: TabsListProps) => {
	return (
		<div className="relative flex w-fit items-center border p-1.5">
			{children}
		</div>
	);
};

const TabsTrigger = ({ onClick, children, isActive }: TabsTriggerProps) => {
	return (
		<button
			onClick={onClick}
			className={cn("relative z-[1] px-4 py-2", { "z-0": isActive })}
			type="button"
		>
			{isActive && (
				<motion.div
					layoutId="active-tab"
					className="absolute inset-0 bg-accent"
					transition={{
						duration: 0.2,
						type: "spring",
						stiffness: 300,
						damping: 25,
						velocity: 2,
					}}
				/>
			)}
			<span
				className={cn(
					"relative block text-sm font-medium duration-200",
					isActive ? "delay-100 text-primary" : "",
				)}
			>
				{children}
			</span>
		</button>
	);
};

function PricingTier({
	tier,
	billingCycle,
}: {
	tier: (typeof siteConfig.pricing)[0];
	billingCycle: "monthly" | "yearly";
}) {
	const { openModal } = useSubscribeModal();

	// Get cost per call based on tier and billing cycle
	const costPerCall =
		COST_PER_CALL[billingCycle][
			tier.name.toLowerCase() as "starter" | "pro" | "ultimate"
		];

	// Calculate savings percentages
	let savingsText = "";
	if (tier.name === "Pro") {
		savingsText = billingCycle === "yearly" ? "83%" : "75%";
	} else if (tier.name === "Ultimate") {
		savingsText = billingCycle === "yearly" ? "50%" : "40%";
	}

	return (
		<div
			className={cn(
				"relative z-10 box-border grid h-full w-full overflow-hidden text-foreground transition-transform-background motion-reduce:transition-none border-t lg:border-r last:border-r-0",
				tier.popular ? "bg-primary/5" : "text-foreground",
			)}
		>
			<div className="flex flex-col h-full">
				<CardHeader className="p-8">
					<CardTitle className="flex flex-col space-y-8">
						<GradientText as="span" className="text-lg font-medium">
							{tier.name}
						</GradientText>
						<div>
							<motion.div
								key={tier.price[billingCycle]}
								initial={{
									opacity: 0,
									x: billingCycle === "yearly" ? -10 : 10,
									filter: "blur(5px)",
								}}
								animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
								transition={{
									duration: 0.25,
									ease: [0.4, 0, 0.2, 1],
								}}
							>
								<GradientText as="span" className="text-5xl font-bold">
									{tier.price[billingCycle]}
								</GradientText>
								<span className="text-sm font-medium text-muted-foreground">
									/{tier.frequency[billingCycle]}
								</span>
							</motion.div>
							<p className="mt-1 text-sm text-muted-foreground">
								({costPerCall} per API call)
								{savingsText && (
									<span className="ml-1 text-xs text-green-500">
										Save {savingsText} vs{" "}
										{tier.name === "Pro" ? "Starter" : "Pro"}
									</span>
								)}
							</p>
							<p className="mt-4 text-base text-muted-foreground">
								{tier.description}
							</p>
						</div>
					</CardTitle>
				</CardHeader>

				<CardContent className="flex-grow px-8 pb-8">
					<ul className="space-y-4">
						{tier.features.map((feature, featureIndex) => (
							<li key={featureIndex} className="flex items-center">
								<Check className="mr-3 size-5 text-green-500" />
								<span className="text-base">{feature}</span>
							</li>
						))}
					</ul>
				</CardContent>

				<div className="p-8 pt-0">
					<Button
						size="lg"
						onClick={openModal}
						className={cn(
							"w-full py-6 text-base font-medium",
							tier.popular
								? "bg-primary text-primary-foreground hover:bg-primary/90"
								: "bg-muted text-foreground hover:bg-muted/80",
						)}
					>
						{tier.cta}
					</Button>
				</div>
			</div>
		</div>
	);
}

export function Pricing() {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"yearly",
	);

	const handleTabChange = (tab: "yearly" | "monthly") => {
		setBillingCycle(tab);
	};

	return (
		<Section
			id="pricing"
			title="Pricing"
			subtitle="Enterprise Security at Startup Prices"
			description="Flexible plans that scale with your usage, from indie developers to enterprise teams. All with no hidden fees."
		>
			<div className="grid grid-rows-1">
				<div className="mb-12 p-8 border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent rounded-lg max-w-4xl mx-auto shadow-sm">
					<div className="flex flex-col md:flex-row items-center gap-8">
						<div className="flex-1">
							<GradientText as="h3" className="text-2xl font-bold mb-3">
								Self-Host For Free
							</GradientText>
							<p className="text-base">
								proxed.ai is 100% open-source. Deploy on your own infrastructure
								with <span className="font-semibold">no usage limits</span>,
								subscription fees, or vendor lock-in.
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Perfect for privacy-focused teams, regulated industries, and
								enterprise deployments.
							</p>
						</div>
						<div>
							<Button
								variant="default"
								size="lg"
								className="text-base font-medium whitespace-nowrap"
								onClick={() =>
									window.open("https://github.com/nech-ai/proxed", "_blank")
								}
							>
								<Icons.github className="mr-2 h-5 w-5" />
								View on GitHub
							</Button>
							<div className="text-xs text-center mt-2 text-muted-foreground">
								⭐ Star us on GitHub
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-rows-1 gap-y-10 p-10">
					<div className="text-center mb-2">
						<h3 className="text-xl font-medium text-foreground">
							Hosted Plans
						</h3>
						<p className="text-muted-foreground text-sm">
							Let us handle the infrastructure while you focus on building great
							AI apps
						</p>
					</div>
					<Tabs
						activeTab={billingCycle}
						setActiveTab={handleTabChange}
						className="mx-auto w-full max-w-md"
					>
						{(activeTab) => (
							<TabsList>
								{["yearly", "monthly"].map((tab) => (
									<TabsTrigger
										key={tab}
										value={tab}
										onClick={() => handleTabChange(tab as "yearly" | "monthly")}
										isActive={activeTab === tab}
									>
										{tab.charAt(0).toUpperCase() + tab.slice(1)}
										{tab === "yearly" && (
											<span className="ml-2 text-xs font-semibold text-green-500">
												Save 25%
											</span>
										)}
									</TabsTrigger>
								))}
							</TabsList>
						)}
					</Tabs>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3">
					{siteConfig.pricing.map((tier, index) => (
						<PricingTier key={index} tier={tier} billingCycle={billingCycle} />
					))}
				</div>
			</div>

			<div className="text-center pt-8 max-w-2xl mx-auto">
				<p className="text-sm mb-2">
					All plans include email support and a 30-day money-back guarantee.
					Prices exclude VAT.
				</p>
				<p className="text-sm text-muted-foreground">
					Need a custom plan or have questions?{" "}
					<a href="mailto:alex@proxed.ai" className="text-primary underline">
						Contact us
					</a>
				</p>
			</div>
		</Section>
	);
}
