"use client";

import { cn } from "@proxed/ui/utils";
import { motion } from "framer-motion";
import type React from "react";
import { forwardRef, useRef } from "react";
import { GradientText } from "./gradient-text";

type Alignment = "left" | "center" | "right";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
	id?: string;
	title?: string;
	subtitle?: string;
	description?: string;
	align?: Alignment;
	noBorder?: boolean;
	className?: string;
	fadeIn?: boolean;
	skipInitialAnimation?: boolean;
}

const FADE_IN_ANIMATION = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
} as const;

function getAlignmentClasses(align: Alignment = "center") {
	return {
		container: cn(
			"w-full",
			align === "left"
				? "text-left"
				: align === "right"
					? "text-right"
					: "text-center",
		),
		subtitle: cn(
			"mt-4 text-4xl font-medium tracking-tight md:text-5xl pb-8",
			align === "center"
				? "mx-auto max-w-[800px]"
				: align === "right"
					? "ml-auto"
					: "",
		),
		description: cn(
			"mt-6 text-lg text-muted-foreground",
			align === "center"
				? "mx-auto max-w-[600px]"
				: align === "right"
					? "ml-auto"
					: "",
		),
	};
}

function SectionHeader({
	title,
	subtitle,
	description,
	align,
	fadeIn,
	skipInitialAnimation,
}: Omit<SectionProps, "children" | "className" | "noBorder">) {
	if (!title && !subtitle && !description) return null;

	const classes = getAlignmentClasses(align);
	const HeaderContent = () => (
		<div
			className={cn(classes.container, "relative w-full overflow-hidden py-4")}
		>
			{title && (
				<h2 className="text-sm font-medium uppercase tracking-wider text-primary">
					{title}
				</h2>
			)}
			{subtitle && (
				<GradientText as="h3" className={classes.subtitle}>
					{subtitle}
				</GradientText>
			)}
			{description && <p className={classes.description}>{description}</p>}
		</div>
	);

	if (fadeIn) {
		return (
			<motion.div
				{...FADE_IN_ANIMATION}
				initial={
					skipInitialAnimation
						? { opacity: 1, y: 0 }
						: FADE_IN_ANIMATION.initial
				}
			>
				<HeaderContent />
			</motion.div>
		);
	}

	return <HeaderContent />;
}

const Section = forwardRef<HTMLElement, SectionProps>(
	(
		{
			id,
			title,
			subtitle,
			description,
			children,
			className,
			align,
			noBorder,
			fadeIn = true,
			skipInitialAnimation = false,
			...props
		},
		forwardedRef,
	) => {
		const internalRef = useRef<HTMLElement>(null);
		const ref = forwardedRef || internalRef;

		const Content = () => (
			<div
				className={cn(
					"relative w-full max-w-[1400px] mx-auto",
					!noBorder && "border border-border",
					className,
				)}
			>
				<SectionHeader
					title={title}
					subtitle={subtitle}
					description={description}
					align={align}
					fadeIn={fadeIn}
					skipInitialAnimation={skipInitialAnimation}
				/>
				{fadeIn ? (
					<motion.div
						{...FADE_IN_ANIMATION}
						initial={
							skipInitialAnimation
								? { opacity: 1, y: 0 }
								: FADE_IN_ANIMATION.initial
						}
					>
						{children}
					</motion.div>
				) : (
					children
				)}
			</div>
		);

		return (
			<section id={id} ref={ref} className={cn("w-full", className)} {...props}>
				<Content />
			</section>
		);
	},
);

Section.displayName = "Section";

export { Section };
