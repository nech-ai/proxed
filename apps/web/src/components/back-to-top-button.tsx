"use client";

import { useEffect, useState } from "react";
import { cn } from "@proxed/ui/lib/utils";
import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => {
		if (window.scrollY > 300) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	};

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	useEffect(() => {
		window.addEventListener("scroll", toggleVisibility);
		return () => {
			window.removeEventListener("scroll", toggleVisibility);
		};
	}, []);

	return (
		<button
			type="button"
			onClick={scrollToTop}
			className={cn(
				"fixed bottom-6 right-6 z-50 p-3 rounded-full bg-sky-600 text-white shadow-lg transition-opacity hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900",
				isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
			)}
			aria-label="Scroll to top"
		>
			<ArrowUp className="w-5 h-5" />
		</button>
	);
}
