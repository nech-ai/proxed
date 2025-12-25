"use client";

import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";
import { cn } from "@proxed/ui/utils";
import { motion } from "framer-motion";
import Link from "next/link";

const STAGGER_CHILD_VARIANTS = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
} as const;

const CONTAINER_VARIANTS = {
	visible: {
		transition: {
			staggerChildren: 0.1,
		},
	},
} as const;

interface FeatureCardProps {
	name: string;
	description: string;
	icon: React.ReactNode;
	href: string;
}

function FeatureCard({
	name,
	description,
	icon: Icon,
	href,
}: FeatureCardProps) {
	return (
		<motion.div
			variants={STAGGER_CHILD_VARIANTS}
			className={cn(
				"group flex flex-col gap-y-4 p-6 border transition-all duration-300",
				"hover:bg-secondary/20 hover:border-primary/20",
				"last:border-b-0",
				"md:[&:nth-child(2n+1)]:border-r md:[&:nth-child(n+5)]:border-b-0",
				"lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(n+4)]:border-b-0 lg:border-r",
			)}
		>
			<div className="flex flex-col gap-y-4">
				<div className="relative w-12 h-12">
					<div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/80 p-3 text-white rounded-lg transition-all duration-300 group-hover:scale-110">
						{Icon}
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="text-xl font-medium tracking-tight text-foreground">
						{name}
					</h3>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
				</div>
			</div>
			<div className="mt-auto pt-4">
				<Link
					href={href}
					className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
				>
					<span className="border-b border-transparent transition-colors group-hover:border-current">
						Learn more
					</span>
					<svg
						className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</Link>
			</div>
		</motion.div>
	);
}

export function Features() {
	return (
		<Section
			id="features"
			title="Features"
			subtitle="Everything you need to secure your AI integration"
			description="Proxed.AI provides a comprehensive set of features to help you secure and manage your AI API keys and responses."
			align="center"
		>
			<motion.div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t"
				variants={CONTAINER_VARIANTS}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-100px" }}
			>
				{siteConfig.features.map((feature) => (
					<FeatureCard key={feature.name} {...feature} />
				))}
			</motion.div>
		</Section>
	);
}
