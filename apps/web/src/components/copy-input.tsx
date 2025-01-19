"use client";

import { cn } from "@proxed/ui/utils";
import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { CopyIcon } from "lucide-react";
import { useState } from "react";

type Props = {
	value: string;
	className?: string;
};

export function CopyInput({ value, className }: Props) {
	const [isCopied, setCopied] = useState(false);

	const handleClipboard = async () => {
		try {
			setCopied(true);

			await navigator.clipboard.writeText(value);

			setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch {}
	};

	return (
		<div
			className={cn(
				"flex items-center relative w-full border border-border py-2 px-4",
				className,
			)}
		>
			<div className="pr-7 text-[#878787] text-sm">{value}</div>
			<button type="button" onClick={handleClipboard} className="block">
				<motion.div
					className="absolute right-4 top-2.5"
					initial={{ opacity: 1, scale: 1 }}
					animate={{ opacity: isCopied ? 0 : 1, scale: isCopied ? 0 : 1 }}
				>
					<CopyIcon />
				</motion.div>

				<motion.div
					className="absolute right-4 top-2.5"
					initial={{ opacity: 0, scale: 0 }}
					animate={{ opacity: isCopied ? 1 : 0, scale: isCopied ? 1 : 0 }}
				>
					<CheckIcon />
				</motion.div>
			</button>
		</div>
	);
}
