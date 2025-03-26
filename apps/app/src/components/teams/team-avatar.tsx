import { config } from "@config";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@proxed/ui/components/avatar";
import { forwardRef, useMemo } from "react";

export const TeamAvatar = forwardRef<
	HTMLSpanElement,
	{
		name: string;
		avatarUrl?: string | null;
		className?: string;
	}
>(({ name, avatarUrl, className }, ref) => {
	const avatarSrc = useMemo(() => avatarUrl ?? undefined, [avatarUrl]);

	// Generate initials from name
	const initials = useMemo(() => {
		if (!name) return "";

		// Split name by spaces and get the first letter of each part
		const nameParts = name.trim().split(/\s+/);
		if (nameParts.length === 1) {
			// Single word - take up to 2 letters
			return name.substring(0, 2).toUpperCase();
		}

		// Multiple words - take first letter of first and last words
		return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
	}, [name]);

	// Generate consistent color based on name
	const bgColor = useMemo(() => {
		if (!name) return "bg-primary/10";

		// Simple hash function to generate color index
		const hash = name.split("").reduce((acc, char) => {
			return acc + char.charCodeAt(0);
		}, 0);

		const colorClasses = [
			"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
			"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
			"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
			"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
			"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
			"bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
		];

		return colorClasses[hash % colorClasses.length];
	}, [name]);

	return (
		<Avatar ref={ref} className={className}>
			<AvatarImage src={avatarSrc} />
			<AvatarFallback className={`text-sm font-medium ${bgColor}`}>
				{initials}
			</AvatarFallback>
		</Avatar>
	);
});

TeamAvatar.displayName = "TeamAvatar";
