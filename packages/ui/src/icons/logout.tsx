"use client";

import { cn } from "@proxed/ui/utils";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const pathVariants: Variants = {
	animate: {
		x: 2,
		translateX: [0, -3, 0],
		transition: {
			duration: 0.4,
		},
	},
};

const LogoutIcon = ({ className }: { className?: string }) => {
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
				aria-label="Logout"
				xmlns="http://www.w3.org/2000/svg"
				className="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
				<motion.polyline
					points="16 17 21 12 16 7"
					variants={pathVariants}
					animate={controls}
				/>
				<motion.line
					x1="21"
					x2="9"
					y1="12"
					y2="12"
					variants={pathVariants}
					animate={controls}
				/>
			</svg>
		</div>
	);
};

export { LogoutIcon };
