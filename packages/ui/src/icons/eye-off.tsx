"use client";

import { cn } from "@proxed/ui/utils";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const pathVariants: Variants = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 2],
    opacity: [0, 1],
    pathOffset: [0, 2],
    transition: { duration: 0.6 },
  },
};

const EyeOffIcon = ({ className }: { className?: string }) => {
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
        aria-label="Eye Off"
        xmlns="http://www.w3.org/2000/svg"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
        <motion.path
          variants={pathVariants}
          d="m2 2 20 20"
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { EyeOffIcon };
