"use client";

import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { UserAvatar } from "@/components/layout/user-avatar";
import type { RouterOutputs } from "@/trpc/types";
import { Button } from "@proxed/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import { Skeleton } from "@proxed/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@proxed/ui/components/table";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { LogOutIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { TeamRoleSelect } from "./team-role-select";
import { useMembershipQuery } from "@/hooks/use-membership";
import { useUserQuery } from "@/hooks/use-user";

export function TeamMembersList({
	memberships,
}: {
	memberships: RouterOutputs["team"]["members"];
}) {
	type TeamMember = RouterOutputs["team"]["members"][number];
	const { role } = useMembershipQuery();
	const { data: user } = useUserQuery();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const { toast } = useToast();

	const columns: ColumnDef<TeamMember>[] = [
		{
			accessorKey: "user",
			header: "",
			accessorFn: (row) => row.userId,
			cell: ({ row }) =>
				row.original.userId ? (
					<div className="flex items-center gap-2">
						<UserAvatar
							name={
								row.original.user?.fullName ?? row.original.user?.email ?? ""
							}
							avatarUrl={row.original.user?.avatarUrl}
						/>
						<div>
							<strong className="block">
								{row.original.user?.fullName ?? row.original.user?.email ?? ""}
							</strong>
							<small className="text-muted-foreground">
								{row.original.user?.email ?? ""}
							</small>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<Skeleton className="size-8 rounded-full" />
						<Skeleton className="h-4 w-full" />
					</div>
				),
		},
		{
			accessorKey: "actions",
			header: "",
			cell: ({ row }) => {
				return (
					<div className="flex flex-row justify-end gap-2">
						<TeamRoleSelect
							value={row.original.role}
							onSelect={async (_value) => {
								toast({
									variant: "default",
									description: "Updating membership role...",
								});
							}}
							disabled={role !== "OWNER" || row.original.isCreator}
						/>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon" variant="ghost">
									<MoreVerticalIcon className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									disabled={row.original.isCreator}
									className="text-destructive"
									onClick={() => {
										toast({
											variant: "default",
											description: "Removing member...",
										});
									}}
								>
									{row.original.user?.id === user?.id ? (
										<>
											<LogOutIcon className="mr-2 size-4" />
											Remove member
										</>
									) : (
										<>
											<TrashIcon className="mr-2 size-4" />
											Remove member
										</>
									)}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: memberships,
		columns,
		manualPagination: true,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div className=" rounded-md border">
			<Table>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
