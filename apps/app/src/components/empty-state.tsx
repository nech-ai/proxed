import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="text-center max-w-md mx-auto px-4">
			<div className="rounded-full bg-muted p-3 mb-4 inline-block">
				<Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
			</div>
			<h2 className="text-lg font-semibold mb-2">{title}</h2>
			<p className="text-muted-foreground mb-4">{description}</p>
			{action}
		</div>
	);
}
