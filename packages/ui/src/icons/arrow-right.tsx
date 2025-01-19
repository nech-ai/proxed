"use client";

import { cn } from "@proxed/ui/utils";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const pathVariants: Variants = {
	normal: { d: "M5 12h14" },
	animate: {
		d: ["M5 12h14", "M5 12h9", "M5 12h14"],
		transition: {
			duration: 0.4,
		},
	},
};

const secondaryPathVariants: Variants = {
	normal: { d: "m12 5 7 7-7 7", translateX: 0 },
	animate: {
		d: "m12 5 7 7-7 7",
		translateX: [0, -3, 0],
		transition: {
			duration: 0.4,
		},
	},
};

const ArrowRightIcon = ({ className }: { className?: string }) => {
	const controls = useAnimation();

	return (
		<div
			className={cn(
				"flex cursor-pointer select-none items-center justify-center rounded-md transition-colors duration-200",
				className,
			)}
			onMouseEnter={() => controls.start("animate")}
			onMouseLeave={() => controls.start("normal")}
		>
			<svg
				aria-label="Arrow Right"
				xmlns="http://www.w3.org/2000/svg"
				className="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<motion.path d="M5 12h14" variants={pathVariants} animate={controls} />
				<motion.path
					d="m12 5 7 7-7 7"
					variants={secondaryPathVariants}
					animate={controls}
				/>
			</svg>
		</div>
	);
};

export { ArrowRightIcon };
