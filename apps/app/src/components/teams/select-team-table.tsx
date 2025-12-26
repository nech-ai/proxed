"use client";

import { Button } from "@proxed/ui/components/button";
import { cn } from "@proxed/ui/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@proxed/ui/components/table";
import { TeamCard } from "./team-card";
import { TeamAvatar } from "./team-avatar";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUserQuery } from "@/hooks/use-user";

export function SelectTeamTable() {
	const trpc = useTRPC();
	const router = useRouter();
	const { data: memberships = [] } = useQuery(
		trpc.team.memberships.queryOptions(),
	);
	const { data: user } = useUserQuery();
	const activeTeamId = user?.teamId;

	const changeTeam = useMutation(
		trpc.team.switch.mutationOptions({
			onSuccess: () => {
				router.push("/");
				router.refresh();
			},
		}),
	);

	return (
		<TeamCard
			title="Select Team"
			description="Select the team you want to activate"
		>
			<Table>
				<TableBody>
					{memberships.map((row) => (
						<TableRow
							key={row.id}
							className={cn(
								"hover:bg-transparent",
								activeTeamId === row.teamId && "bg-muted/50 hover:bg-muted/50",
							)}
						>
							<TableCell className="border-r-[0px] py-4">
								<div className="flex items-center space-x-4">
									<TeamAvatar
										className="h-8 w-8"
										name={row.team?.name ?? ""}
										avatarUrl={row.team?.avatarUrl ?? ""}
									/>
									<div className="flex flex-col">
										<span
											className={cn(
												"font-medium text-sm",
												activeTeamId === row.teamId && "text-muted-foreground",
											)}
										>
											{row.team?.name ?? ""}{" "}
											{activeTeamId === row.teamId && "(active)"}
										</span>
									</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="flex justify-end">
									<div className="flex items-center space-x-3">
										<Button
											variant="outline"
											disabled={
												activeTeamId === row.teamId || changeTeam.isPending
											}
											onClick={() => changeTeam.mutate({ teamId: row.teamId })}
										>
											Activate
										</Button>
									</div>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TeamCard>
	);
}
