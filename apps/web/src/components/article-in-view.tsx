"use client";

import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";

interface ArticleInViewProps {
	firstPost: boolean;
	slug: string;
	className?: string;
}

export function ArticleInView({
	slug,
	firstPost,
	className,
}: ArticleInViewProps) {
	const pathname = usePathname();
	const fullSlug = `/updates/${slug}`;

	const updateUrl = useCallback(() => {
		window.history.pushState({ urlPath: fullSlug }, "", fullSlug);
	}, [fullSlug]);

	const { ref, inView } = useInView({
		threshold: 0.5,
		rootMargin: "-100px",
	});

	useEffect(() => {
		if (inView && pathname !== fullSlug) {
			updateUrl();
		}
	}, [inView, pathname, fullSlug, updateUrl]);

	return <div ref={ref} className={className} />;
}
