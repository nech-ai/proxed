"use client";

import { cn } from "@proxed/ui/utils";

import { TrendingDown } from "lucide-react";
import { TrendingUp } from "lucide-react";
type Props = {
	value: string;
	variant?: "positive" | "negative";
};

export function Status({ value, variant }: Props) {
	return (
		<div
			className={cn(
				"flex items-center space-x-1 text-[#FF3638]",
				variant === "positive" && "text-[#00C969]",
			)}
		>
			{variant === "positive" ? (
				<TrendingUp size={14} />
			) : (
				<TrendingDown size={14} />
			)}

			<p className="font-medium text-[12px]">{value}</p>
		</div>
	);
}
