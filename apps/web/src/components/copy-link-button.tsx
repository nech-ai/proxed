"use client";

import { useState, useEffect } from "react";
import { cn } from "@proxed/ui/lib/utils";
import { Link2, Check } from "lucide-react";

interface CopyLinkButtonProps {
	slug: string;
	className?: string;
}

export function CopyLinkButton({ slug, className }: CopyLinkButtonProps) {
	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = async () => {
		const url = `${window.location.origin}/changelog/${slug}`;
		try {
			await navigator.clipboard.writeText(url);
			setIsCopied(true);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
	};

	useEffect(() => {
		if (isCopied) {
			const timer = setTimeout(() => {
				setIsCopied(false);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isCopied]);

	return (
		<button
			type="button"
			onClick={copyToClipboard}
			className={cn(
				"p-1.5 text-gray-500 hover:text-sky-500 focus-visible:text-sky-500 rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
				className,
			)}
			aria-label={isCopied ? "Link copied!" : "Copy link to this entry"}
			title={isCopied ? "Link copied!" : "Copy link to this entry"}
		>
			{isCopied ? (
				<Check className="w-4 h-4 text-green-500" />
			) : (
				<Link2 className="w-4 h-4" />
			)}
		</button>
	);
}
