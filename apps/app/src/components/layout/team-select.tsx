"use client";
import { changeTeamAction } from "@/actions/change-team-action";

import type { TeamMembership } from "@proxed/supabase/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { redirect } from "next/navigation";
// import { CreateTeamDialog } from "../teams/create-team-dialog";
import { TeamAvatar } from "../teams/team-avatar";
import { useTeamContext } from "@/store/team/hook";

export function TeamSelect({
	activeTeamId,
	teamMemberships,
	className,
}: {
	activeTeamId: string | null;
	teamMemberships: TeamMembership[];
	className?: string;
}) {
	const changeTeam = useAction(changeTeamAction);

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
		<div className={className}>
			<DropdownMenu>
				<DropdownMenuTrigger className="-ml-2 flex w-full items-center justify-between rounded-md p-2 text-left outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring">
					<div className="flex items-center justify-start gap-2 text-sm">
						<span className="hidden lg:block">
							<TeamAvatar
								className="size-8"
								name={activeTeam.team?.name ?? ""}
								avatarUrl={activeTeam.team?.avatar_url ?? ""}
							/>
						</span>
						<span className="block flex-1 truncate">
							{activeTeam.team?.name ?? ""}
						</span>
						<ChevronsUpDownIcon className="block size-4 opacity-50" />
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-full">
					<DropdownMenuRadioGroup
						value={activeTeam.team_id}
						onValueChange={switchTeam}
					>
						{teamMemberships.map((teamMembership) => (
							<DropdownMenuRadioItem
								key={teamMembership.team_id}
								value={teamMembership.team_id}
								className="flex items-center justify-center gap-2"
							>
								<div className="flex flex-1 items-center justify-start gap-2">
									<TeamAvatar
										className="size-6"
										name={teamMembership.team?.name ?? ""}
										avatarUrl={teamMembership.team?.avatar_url ?? ""}
									/>
									{teamMembership.team?.name ?? ""}
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => redirect("/teams/create")}>
							<PlusIcon className="mr-2 size-4" />
							Create Team
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* <CreateTeamDialog /> */}
		</div>
	);
}
