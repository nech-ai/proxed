"use client";

import { changeTeamAction } from "@/actions/change-team-action";
import type { TeamMembership } from "@proxed/supabase/types";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@proxed/ui/components/avatar";
import { Button } from "@proxed/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { cn } from "@proxed/ui/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@proxed/ui/components/table";
import { useAction } from "next-safe-action/hooks";

export function SelectTeamTable({
	data,
	activeTeamId,
}: {
	data: TeamMembership[];
	activeTeamId: string | null | undefined;
}) {
	const changeTeam = useAction(changeTeamAction);

	return (
		<Card className="w-[350px]">
			<CardHeader className="space-y-1">
				<CardTitle className="text-center text-2xl">Select Team</CardTitle>
				<CardDescription className="text-center">
					Select the team you want to activate
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableBody>
						{data.map((row) => (
							<TableRow
								key={row.id}
								className={cn(
									"hover:bg-transparent",
									activeTeamId === row.team_id &&
										"bg-muted/50 hover:bg-muted/50",
								)}
							>
								<TableCell className="border-r-[0px] py-4">
									<div className="flex items-center space-x-4">
										<Avatar className="h-8 w-8 rounded-full">
											<AvatarImage src={row.team?.avatar_url ?? ""} />
											<AvatarFallback>
												<span className="text-xs">
													{row.team?.name?.charAt(0)?.toUpperCase() ?? ""}
												</span>
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span
												className={cn(
													"font-medium text-sm",
													activeTeamId === row.team_id &&
														"text-muted-foreground",
												)}
											>
												{row.team?.name ?? ""}{" "}
												{activeTeamId === row.team_id && "(active)"}
											</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex justify-end">
										<div className="flex items-center space-x-3">
											<Button
												variant="outline"
												disabled={activeTeamId === row.team_id}
												onClick={() =>
													changeTeam.execute({
														teamId: row.team_id,
														redirectTo: "/",
													})
												}
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
			</CardContent>
		</Card>
	);
}
