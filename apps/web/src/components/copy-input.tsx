"use client";

import { cn } from "@proxed/ui/utils";
import { motion } from "framer-motion";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState, useCallback } from "react";

const COPY_TIMEOUT = 2000;

interface CopyIconAnimationProps {
	icon: React.ReactNode;
	show: boolean;
	className?: string;
}

function CopyIconAnimation({ icon, show, className }: CopyIconAnimationProps) {
	return (
		<motion.div
			className={cn("absolute right-4 top-2.5", className)}
			initial={{ opacity: 0, scale: 0 }}
			animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0 }}
		>
			{icon}
		</motion.div>
	);
}

interface CopyInputProps {
	value: string;
	className?: string;
	onCopy?: (value: string) => void;
}

export function CopyInput({ value, className, onCopy }: CopyInputProps) {
	const [isCopied, setCopied] = useState(false);

	const handleClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			onCopy?.(value);
			setTimeout(() => setCopied(false), COPY_TIMEOUT);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	}, [value, onCopy]);

	return (
		<div
			className={cn(
				"flex items-center relative w-full border border-border py-2 px-4 rounded-md bg-background/50",
				className,
			)}
		>
			<div className="pr-7 text-muted-foreground text-sm font-mono truncate">
				{value}
			</div>
			<button
				type="button"
				onClick={handleClipboard}
				className="block text-muted-foreground hover:text-foreground transition-colors"
				aria-label={isCopied ? "Copied" : "Copy to clipboard"}
			>
				<CopyIconAnimation icon={<CopyIcon />} show={!isCopied} />
				<CopyIconAnimation
					icon={<CheckIcon className="text-green-500" />}
					show={isCopied}
				/>
			</button>
		</div>
	);
}
