"use client";

import { cn } from "@proxed/ui/utils";
import { type Variants, motion, useAnimation } from "motion/react";

const pathVariants: Variants = {
	normal: { translateX: 0, translateY: 0 },
	animate: { translateX: 1.1, translateY: -1.1 },
};

const ChartPieIcon = ({ className }: { className?: string }) => {
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
				className="size-4"
				aria-label="Chart Pie"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<motion.path
					d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"
					transition={{
						type: "spring",
						stiffness: 250,
						damping: 15,
						bounce: 0.6,
					}}
					variants={pathVariants}
					animate={controls}
				/>
				<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
			</motion.svg>
		</div>
	);
};

export { ChartPieIcon };
