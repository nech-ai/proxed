import * as React from "react";
import { Badge } from "./badge";
import { cn } from "@proxed/ui/lib/utils";
import type { ModelBadge as ModelBadgeType } from "@proxed/utils/lib/providers";

interface ModelBadgeProps {
	badge: ModelBadgeType;
	className?: string;
}

const badgeConfig: Record<
	ModelBadgeType,
	{ variant: any; className: string; label: string }
> = {
	new: {
		variant: "secondary",
		className:
			"bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-400 border-green-500/30",
		label: "New",
	},
	deprecated: {
		variant: "secondary",
		className:
			"bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 dark:text-orange-400 border-orange-500/30",
		label: "Deprecated",
	},
	preview: {
		variant: "secondary",
		className:
			"bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-400 border-blue-500/30",
		label: "Preview",
	},
	beta: {
		variant: "secondary",
		className:
			"bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-400 border-purple-500/30",
		label: "Beta",
	},
	experimental: {
		variant: "secondary",
		className:
			"bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
		label: "Experimental",
	},
};

export function ModelBadge({ badge, className }: ModelBadgeProps) {
	const config = badgeConfig[badge];

	return (
		<Badge
			variant={config.variant}
			className={cn(
				"mx-1.5 px-1.5 py-0 text-[10px] font-medium h-[18px] border",
				config.className,
				className,
			)}
		>
			{config.label}
		</Badge>
	);
}
