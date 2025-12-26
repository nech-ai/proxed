"use client";

import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	HardDriveIcon,
	LogOut,
	MoonIcon,
	SunIcon,
} from "lucide-react";

import type { RouterOutputs } from "@/trpc/types";
import { createClient } from "@proxed/supabase/client";
import { Avatar, AvatarFallback } from "@proxed/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@proxed/ui/components/sidebar";
import Link from "next/link";
import { cn } from "@proxed/ui/utils";
import { useTheme } from "next-themes";
import { useState } from "react";
import { UserAvatar } from "./user-avatar";
import { useRouter } from "next/navigation";

export function NavUser({
	user,
}: {
	user: NonNullable<RouterOutputs["user"]["me"]>;
}) {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const supabase = createClient();

	const { setTheme: setCurrentTheme, theme: currentTheme } = useTheme();
	const [theme, setTheme] = useState<string>(currentTheme ?? "system");

	const colorModeOptions = [
		{
			value: "system",
			label: "System",
			icon: HardDriveIcon,
		},
		{
			value: "light",
			label: "Light",
			icon: SunIcon,
		},
		{
			value: "dark",
			label: "Dark",
			icon: MoonIcon,
		},
	];

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<UserAvatar
									className="size-8"
									name={user.fullName ?? ""}
									avatarUrl={user.avatarUrl}
								/>
								<AvatarFallback className="rounded-lg">CN</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{user.fullName ?? ""}
								</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<UserAvatar
										className="size-8"
										name={user.fullName ?? ""}
										avatarUrl={user.avatarUrl}
									/>
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user.fullName ?? ""}
									</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								<Link href="/settings/account/general">Account</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="rounded-md">
								<SunIcon className="mr-2 size-4" />
								Color mode
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent
									className={cn(
										"p-2",
										isMobile &&
											"right-[16px] left-[16px] w-[calc(100vw-32px)] max-w-[20rem]",
									)}
									sideOffset={-4}
								>
									<DropdownMenuRadioGroup
										value={theme}
										onValueChange={(value) => {
											setTheme(value);
											setCurrentTheme(value);
										}}
									>
										{colorModeOptions.map((option) => (
											<DropdownMenuRadioItem
												key={option.value}
												value={option.value}
												className="rounded-md "
											>
												<option.icon className="mr-2 size-4 opacity-50" />
												{option.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={async () => {
								await supabase.auth.signOut();
								router.push("/login");
								router.refresh();
							}}
						>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
