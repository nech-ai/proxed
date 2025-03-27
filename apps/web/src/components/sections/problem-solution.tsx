"use client";

import { siteConfig } from "@/lib/config";
import { motion } from "framer-motion";
import { Section } from "../section";
import { cn } from "@proxed/ui/utils";
import { GradientText } from "../gradient-text";

const ease = [0.16, 1, 0.3, 1];

function ProblemCard({
	title,
	description,
	icon,
	index,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	index: number;
}) {
	return (
		<motion.div
			className="group relative flex flex-col gap-6 border border-border/50 bg-card/30 p-6 transition-all hover:bg-card/50 h-full"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.8, delay: index * 0.1, ease }}
		>
			<div className="flex items-start gap-6">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center bg-destructive/10 text-destructive ring-1 ring-destructive/20 rounded-full">
					{icon}
				</div>
				<div className="space-y-2.5">
					<h3 className="text-lg font-medium tracking-tight text-foreground">
						{title}
					</h3>
					<p className="text-base leading-relaxed text-muted-foreground">
						{description}
					</p>
				</div>
			</div>
			<motion.div
				className="absolute inset-0 -z-10 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent opacity-0 transition-opacity duration-500"
				initial={false}
				animate={{ opacity: 0 }}
				whileHover={{ opacity: 1 }}
			/>
		</motion.div>
	);
}

function SolutionCard({
	title,
	description,
	icon,
	index,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	index: number;
}) {
	return (
		<motion.div
			className="group relative flex flex-col gap-6 border border-border/50 bg-card/30 p-6 transition-all hover:bg-card/50 h-full"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.8, delay: index * 0.1, ease }}
		>
			<div className="flex items-start gap-6">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/20 rounded-full">
					{icon}
				</div>
				<div className="space-y-2.5">
					<h3 className="text-lg font-medium tracking-tight text-foreground">
						{title}
					</h3>
					<p className="text-base leading-relaxed text-muted-foreground">
						{description}
					</p>
				</div>
			</div>
			<motion.div
				className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 transition-opacity duration-500"
				initial={false}
				animate={{ opacity: 0 }}
				whileHover={{ opacity: 1 }}
			/>
		</motion.div>
	);
}

export function ProblemSolution() {
	const { problemSolution } = siteConfig;

	return (
		<>
			<Section
				id="problem"
				title="The Challenge"
				subtitle={problemSolution.problem.title}
				description={problemSolution.problem.description}
			>
				<div className="my-8">
					<div className="grid gap-8 md:grid-cols-2">
						{problemSolution.problem.points.map((point, index) => (
							<ProblemCard key={point.title} {...point} index={index} />
						))}
					</div>
				</div>
				<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-destructive/5 via-transparent to-transparent opacity-30" />
			</Section>

			<Section
				id="solution"
				title="The Solution"
				subtitle={problemSolution.solution.title}
				description={problemSolution.solution.description}
			>
				<div className="my-8">
					<div className="grid gap-8 md:grid-cols-2">
						{problemSolution.solution.points.map((point, index) => (
							<SolutionCard key={point.title} {...point} index={index} />
						))}
					</div>
				</div>
				<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-30" />
			</Section>
		</>
	);
}
