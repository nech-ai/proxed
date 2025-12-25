"use client";

import type { RouterOutputs } from "@/trpc/types";
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
import { TeamAvatar } from "../teams/team-avatar";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function TeamSelect({
	activeTeamId,
	teamMemberships,
	className,
}: {
	activeTeamId: string | null;
	teamMemberships: RouterOutputs["team"]["memberships"];
	className?: string;
}) {
	const trpc = useTRPC();
	const router = useRouter();

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
		<div className={className}>
			<DropdownMenu>
				<DropdownMenuTrigger className="-ml-2 flex w-full items-center justify-between rounded-md p-2 text-left outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring">
					<div className="flex items-center justify-start gap-2 text-sm">
						<span className="hidden lg:block">
							<TeamAvatar
								className="size-8"
								name={activeTeam.team?.name ?? ""}
								avatarUrl={activeTeam.team?.avatarUrl ?? ""}
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
						value={activeTeam.teamId}
						onValueChange={switchTeam}
					>
						{teamMemberships.map((teamMembership) => (
							<DropdownMenuRadioItem
								key={teamMembership.teamId}
								value={teamMembership.teamId}
								className="flex items-center justify-center gap-2"
								disabled={changeTeam.isPending}
							>
								<div className="flex flex-1 items-center justify-start gap-2">
									<TeamAvatar
										className="size-6"
										name={teamMembership.team?.name ?? ""}
										avatarUrl={teamMembership.team?.avatarUrl ?? ""}
									/>
									{teamMembership.team?.name ?? ""}
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => router.push("/teams/create")}>
							<PlusIcon className="mr-2 size-4" />
							Create Team
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
