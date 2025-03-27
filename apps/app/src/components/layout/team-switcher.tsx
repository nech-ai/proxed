"use client";
import { changeTeamAction } from "@/actions/change-team-action";
import type { TeamMembership } from "@proxed/supabase/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
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
import { cn } from "@proxed/ui/utils";
import { useTeamContext } from "@/store/team/hook";

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
	const { isMobile, open } = useSidebar();
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
							size={open ? "lg" : "sm"}
							className={cn(
								"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
								!open && "p-0 h-10 w-10 justify-center",
							)}
						>
							{open ? (
								<>
									<div className="flex items-center justify-center">
										<TeamAvatar
											className="size-8"
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
								</>
							) : (
								<TeamAvatar
									className="size-7"
									name={activeTeam.team?.name ?? ""}
									avatarUrl={activeTeam.team?.avatar_url ?? ""}
								/>
							)}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Teams
						</DropdownMenuLabel>
						{teamMemberships.map((teamMembership) => (
							<DropdownMenuItem
								key={teamMembership.team_id}
								onClick={() => switchTeam(teamMembership.team_id)}
								className="gap-2 p-2"
							>
								<div className="flex items-center justify-center">
									<TeamAvatar
										className="size-6"
										name={teamMembership.team?.name ?? ""}
										avatarUrl={teamMembership.team?.avatar_url ?? ""}
									/>
								</div>
								{teamMembership.team?.name ?? ""}
								<span className="ml-auto text-xs text-muted-foreground capitalize">
									{teamMembership.role?.toLowerCase() || "member"}
								</span>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
