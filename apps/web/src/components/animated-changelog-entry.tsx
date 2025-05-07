"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@proxed/ui/lib/utils";

interface AnimatedChangelogEntryProps {
	children: React.ReactNode;
	className?: string;
	delay?: string;
}

export function AnimatedChangelogEntry({
	children,
	className,
	delay,
}: AnimatedChangelogEntryProps) {
	const [isVisible, setIsVisible] = useState(false);
	const entryRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true);
						if (entryRef.current) {
							observer.unobserve(entryRef.current);
						}
					}
				});
			},
			{
				threshold: 0.1,
			},
		);

		if (entryRef.current) {
			observer.observe(entryRef.current);
		}

		return () => {
			if (entryRef.current) {
				observer.unobserve(entryRef.current);
			}
		};
	}, []);

	return (
		<div
			ref={entryRef}
			className={cn(
				"transition-all duration-700 ease-out",
				delay,
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
				className,
			)}
		>
			{children}
		</div>
	);
}
