"use client";

import { cn } from "@proxed/ui/utils";
import { type Variants, motion, useAnimation } from "motion/react";

const pathVariants: Variants = {
	normal: { opacity: 1 },
	animate: (i: number) => ({
		opacity: [0, 1],
		transition: { delay: i * 0.1, duration: 0.3 },
	}),
};

const SunIcon = ({ className }: { className?: string }) => {
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
				aria-label="Sun"
				xmlns="http://www.w3.org/2000/svg"
				className="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="12" cy="12" r="4" />
				{[
					"M12 2v2",
					"m19.07 4.93-1.41 1.41",
					"M20 12h2",
					"m17.66 17.66 1.41 1.41",
					"M12 20v2",
					"m6.34 17.66-1.41 1.41",
					"M2 12h2",
					"m4.93 4.93 1.41 1.41",
				].map((d, index) => (
					<motion.path
						key={d}
						d={d}
						animate={controls}
						variants={pathVariants}
						custom={index + 1}
					/>
				))}
			</svg>
		</div>
	);
};

export { SunIcon };
