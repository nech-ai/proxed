"use client";

import { cn } from "@proxed/ui/utils";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const variants: Variants = {
	normal: { rotate: 0 },
	animate: { rotate: [0, -10, 10, -10, 0] },
};

const CircleHelpIcon = ({ className }: { className?: string }) => {
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
				aria-label="Circle Help"
				xmlns="http://www.w3.org/2000/svg"
				className="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<motion.g
					variants={variants}
					transition={{
						duration: 0.5,
						ease: "easeInOut",
					}}
					animate={controls}
				>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
					<path d="M12 17h.01" />
				</motion.g>
			</svg>
		</div>
	);
};

export { CircleHelpIcon };
