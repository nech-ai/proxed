import { cn } from "@proxed/ui/utils";

interface PostStatusProps {
	status: string;
	className?: string;
	variant?: "purple" | "blue" | "green";
}

const STATUS_VARIANTS = {
	purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
	blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
	green: "border-green-500/20 bg-green-500/10 text-green-400",
} as const;

export function PostStatus({
	status,
	className,
	variant = "purple",
}: PostStatusProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center border px-4 py-1.5 text-sm backdrop-blur font-mono mb-4",
				STATUS_VARIANTS[variant],
				className,
			)}
		>
			{status}
		</div>
	);
}
