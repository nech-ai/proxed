"use client";

import FlickeringGrid from "@/components/ui/flickering-grid";
import { cn } from "@proxed/ui/utils";
import type React from "react";
import { forwardRef, useRef } from "react";

interface SectionProps {
	id?: string;
	title?: string;
	subtitle?: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
	align?: "left" | "center" | "right";
}

const Section = forwardRef<HTMLElement, SectionProps>(
	(
		{ id, title, subtitle, description, children, className, align },
		forwardedRef,
	) => {
		const internalRef = useRef<HTMLElement>(null);
		const ref = forwardedRef || internalRef;
		const alignmentClass =
			align === "left"
				? "text-left"
				: align === "right"
					? "text-right"
					: "text-center";

		return (
			<section id={id} ref={ref}>
				<div
					className={cn(
						"relative w-full max-w-[1400px] mx-auto border border-border px-0",
						className,
					)}
				>
					{(title || subtitle || description) && (
						<div
							className={cn(
								alignmentClass,
								"relative w-full overflow-hidden py-4",
							)}
						>
							{title && (
								<h2 className="text-sm font-medium uppercase tracking-wider text-primary">
									{title}
								</h2>
							)}

							{subtitle && (
								<h3
									className={cn(
										"mt-4 text-4xl font-medium tracking-tight text-foreground md:text-5xl",
										align === "center"
											? "mx-auto max-w-[800px]"
											: align === "right"
												? "ml-auto"
												: "",
									)}
								>
									{subtitle}
								</h3>
							)}
							{description && (
								<p
									className={cn(
										"mt-6 text-lg text-muted-foreground",
										align === "center"
											? "mx-auto max-w-[600px]"
											: align === "right"
												? "ml-auto"
												: "",
									)}
								>
									{description}
								</p>
							)}
							<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-full w-full bg-gradient-to-t from-background dark:from-background -z-10 from-50%" />
							<FlickeringGrid
								squareSize={4}
								gridGap={4}
								color="#6B7280"
								maxOpacity={0.2}
								flickerChance={0.1}
								className="-z-20 absolute inset-0 size-full"
							/>
						</div>
					)}
					{children}
				</div>
			</section>
		);
	},
);

Section.displayName = "Section";

export { Section };
