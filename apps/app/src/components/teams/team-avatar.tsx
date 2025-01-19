import { config } from "@config";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@proxed/ui/components/avatar";
import BoringAvatar from "boring-avatars";
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

	return (
		<Avatar ref={ref} className={className}>
			<AvatarImage src={avatarSrc} />
			<AvatarFallback>
				<BoringAvatar
					size={96}
					name={name}
					variant="marble"
					colors={config.teams.avatarColors}
				/>
			</AvatarFallback>
		</Avatar>
	);
});

TeamAvatar.displayName = "TeamAvatar";
