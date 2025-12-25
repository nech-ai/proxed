"use client";

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
import { TeamAvatar } from "../teams/team-avatar";
import { cn } from "@proxed/ui/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUserQuery } from "@/hooks/use-user";

export function TeamSwitcher({ className }: { className?: string }) {
	const { isMobile, open } = useSidebar();
	const trpc = useTRPC();
	const router = useRouter();
	const { data: teamMemberships = [] } = useQuery(
		trpc.team.memberships.queryOptions(),
	);
	const { data: user } = useUserQuery();
	const activeTeamId = user?.teamId ?? null;
	const activeTeam = teamMemberships.find(
		(teamMembership) => activeTeamId === teamMembership.teamId,
	);

	const changeTeam = useMutation(
		trpc.team.switch.mutationOptions({
			onSuccess: () => {
				router.push("/");
				router.refresh();
			},
		}),
	);

	const switchTeam = (teamId: string) => {
		if (!activeTeam) {
			return;
		}

		changeTeam.mutate({ teamId });
	};

	if (!activeTeam) {
		return null;
	}

	return (
		<SidebarMenu className={className}>
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
											avatarUrl={activeTeam.team?.avatarUrl ?? ""}
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
									avatarUrl={activeTeam.team?.avatarUrl ?? ""}
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
								key={teamMembership.teamId}
								onClick={() => switchTeam(teamMembership.teamId)}
								className="gap-2 p-2"
								disabled={changeTeam.isPending}
							>
								<div className="flex items-center justify-center">
									<TeamAvatar
										className="size-6"
										name={teamMembership.team?.name ?? ""}
										avatarUrl={teamMembership.team?.avatarUrl ?? ""}
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
