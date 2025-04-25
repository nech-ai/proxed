"use client";

import { cn } from "@proxed/ui/utils";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const svgVariants: Variants = {
	normal: { rotate: 0 },
	animate: { rotate: [0, -10, 10, -10, 0] },
};

const BellIcon = ({ className }: { className?: string }) => {
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
			<motion.svg
				xmlns="http://www.w3.org/2000/svg"
				className="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				variants={svgVariants}
				animate={controls}
				transition={{
					duration: 0.5,
					ease: "easeInOut",
				}}
			>
				<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
				<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
			</motion.svg>
		</div>
	);
};

export { BellIcon };
