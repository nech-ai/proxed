"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { CopyIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@proxed/ui/lib/utils";

const COPY_TIMEOUT = 2000;

interface CopyIconAnimationProps {
	show: boolean;
	icon: React.ReactNode;
	className?: string;
}

function CopyIconAnimation({ show, icon, className }: CopyIconAnimationProps) {
	return (
		<motion.div
			className={cn("absolute -left-4 top-0.5", className)}
			initial={{ opacity: 0, scale: 0 }}
			animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0 }}
		>
			{icon}
		</motion.div>
	);
}

export function PostCopyURL() {
	const [isCopied, setCopied] = useState(false);

	const handleClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), COPY_TIMEOUT);
		} catch (error) {
			console.error("Failed to copy URL:", error);
		}
	}, []);

	return (
		<button
			type="button"
			onClick={handleClipboard}
			className="group relative flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
			aria-label={isCopied ? "Link copied" : "Copy link"}
			title="Copy link to clipboard"
		>
			<CopyIconAnimation
				show={!isCopied}
				icon={<CopyIcon className="h-4 w-4" />}
			/>
			<CopyIconAnimation
				show={isCopied}
				icon={<CheckIcon className="h-4 w-4 text-green-400" />}
			/>
			<span className="text-xs ml-2 group-hover:text-white">Copy link</span>
		</button>
	);
}
