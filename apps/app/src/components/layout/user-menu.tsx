"use client";

import type { RouterOutputs } from "@/trpc/types";
import { createClient } from "@proxed/supabase/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import { useMediaQuery } from "@proxed/ui/hooks/use-media-query";
import { CircleHelpIcon, LogoutIcon, SettingsGearIcon } from "@proxed/ui/icons";
import { cn } from "@proxed/ui/utils";
import { LifeBuoy } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "./user-avatar";

interface UserMenuProps {
	user: NonNullable<RouterOutputs["user"]["me"]>;
	className?: string;
}

export function UserMenu({ user, className }: UserMenuProps) {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const router = useRouter();
	const supabase = createClient();

	if (!user) {
		return null;
	}

	const { fullName, email, avatarUrl } = user;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
					aria-label="User menu"
				>
					<UserAvatar name={fullName ?? ""} avatarUrl={avatarUrl} />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className={cn(
					"w-56 p-2",
					isMobile &&
						"right-[16px] left-[16px] w-[calc(100vw-32px)] max-w-[20rem]",
					className,
				)}
				side="bottom"
				sideOffset={8}
			>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">{fullName}</p>
						<p className="text-muted-foreground text-xs leading-none">
							{email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<DropdownMenuItem asChild className="rounded-md">
					<Link href="/settings/account/general">
						<SettingsGearIcon className="mr-2 size-4" />
						Settings
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild className="rounded-md">
					<a
						href="https://docs.proxed.ai"
						target="_blank"
						rel="noopener noreferrer"
					>
						<CircleHelpIcon className="mr-2 size-4" />
						Documentation
					</a>
				</DropdownMenuItem>

				<DropdownMenuItem asChild className="rounded-md">
					<Link href="/settings/account/support">
						<LifeBuoy className="mr-2 size-4" />
						Support
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={async () => {
						await supabase.auth.signOut();
						router.push("/login");
						router.refresh();
					}}
					className="rounded-md"
				>
					<LogoutIcon className="mr-2 size-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
