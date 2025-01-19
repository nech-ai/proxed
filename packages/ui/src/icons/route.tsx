"use client";

import { cn } from "@proxed/ui/utils";
import {
  type Transition,
  type Variants,
  motion,
  useAnimation,
} from "motion/react";

const circleTransition: Transition = {
  duration: 0.3,
  delay: 0.1,
  opacity: { delay: 0.15 },
};

const circleVariants: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
  },
};

const RouteIcon = ({ className }: { className?: string }) => {
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
        aria-label="Route"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.circle
          cx="6"
          cy="19"
          r="3"
          transition={circleTransition}
          variants={circleVariants}
          animate={controls}
        />
        <motion.path
          d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"
          transition={{ duration: 0.7, delay: 0.5, opacity: { delay: 0.5 } }}
          variants={{
            normal: {
              pathLength: 1,
              opacity: 1,
              pathOffset: 0,
            },
            animate: {
              pathLength: [0, 1],
              opacity: [0, 1],
              pathOffset: [1, 0],
            },
          }}
          animate={controls}
        />
        <motion.circle
          cx="18"
          cy="5"
          r="3"
          transition={circleTransition}
          variants={circleVariants}
          animate={controls}
        />
      </motion.svg>
    </div>
  );
};

export { RouteIcon };
