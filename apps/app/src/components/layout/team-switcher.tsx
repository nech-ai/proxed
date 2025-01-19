"use client";
import { changeTeamAction } from "@/actions/change-team-action";
import { useTeam } from "@/hooks/use-team";
import type { TeamMembership } from "@proxed/supabase/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@proxed/ui/components/sidebar";
import { ChevronsUpDown } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { TeamAvatar } from "../teams/team-avatar";

export function TeamSwitcher({
	activeTeamId,
	teamMemberships,
	className,
}: {
	activeTeamId: string | null;
	teamMemberships: TeamMembership[];
	className?: string;
}) {
	const changeTeam = useAction(changeTeamAction);
	const { reloadTeamId } = useTeam();
	const { isMobile } = useSidebar();
	const activeTeam = teamMemberships.find(
		(teamMembership) => activeTeamId === teamMembership.team_id,
	);

	const switchTeam = (teamId: string) => {
		if (!activeTeam) {
			return;
		}

		changeTeam.execute({
			teamId,
			redirectTo: "/",
		});
		reloadTeamId(teamId);
	};

	if (!activeTeam) {
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
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<TeamAvatar
									name={activeTeam.team?.name ?? ""}
									avatarUrl={activeTeam.team?.avatar_url ?? ""}
								/>
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeTeam.team?.name ?? ""}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Teams
						</DropdownMenuLabel>
						{teamMemberships.map((teamMembership, index) => (
							<DropdownMenuItem
								key={teamMembership.team_id}
								onClick={() => switchTeam(teamMembership.team_id)}
								className="gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center rounded-sm border">
									<TeamAvatar
										className="size-6"
										name={teamMembership.team?.name ?? ""}
										avatarUrl={teamMembership.team?.avatar_url ?? ""}
									/>
								</div>
								{teamMembership.team?.name ?? ""}
								<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
