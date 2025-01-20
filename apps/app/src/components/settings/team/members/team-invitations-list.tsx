"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@proxed/ui/components/table";

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

import { deleteInviteAction } from "@/actions/delete-invite-action";
import type { TeamInvitation } from "@proxed/supabase/types";
import { Button } from "@proxed/ui/components/button";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { MoreVerticalIcon, UndoIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { TeamRoleSelect } from "./team-role-select";

export function TeamInvitationsList({
	invitations,
}: {
	invitations: TeamInvitation[];
}) {
	const { toast } = useToast();
	const teamMembership = {
		role: "OWNER",
	};

	const deleteInvite = useAction(deleteInviteAction, {
		onSuccess: () => {
			toast({
				description: "The invite has been revoked.",
				duration: 3500,
				variant: "default",
			});
		},
		onError: () => {
			toast({
				duration: 3500,
				variant: "destructive",
				description: "Something went wrong please try again.",
			});
		},
	});

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const columns: ColumnDef<TeamInvitation>[] = [
		{
			accessorKey: "email",
			accessorFn: (row) => row.email,
			cell: ({ row }) => <div>{row.original.email}</div>,
		},
		{
			accessorKey: "actions",
			cell: ({ row }) => {
				return (
					<div className="flex flex-row justify-end gap-2">
						<TeamRoleSelect
							value={row.original.role}
							disabled
							onSelect={() => {
								return;
							}}
						/>

						{teamMembership?.role === "OWNER" && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="icon" variant="ghost">
										<MoreVerticalIcon className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem
										onClick={() => {
											deleteInvite.execute({
												id: row.original.id,
												revalidatePath: "settings/team/members",
											});
										}}
									>
										<UndoIcon className="mr-2 size-4" />
										Revoke
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: invitations,
		columns,
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
		<div className="rounded-md border">
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
								No invitations
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
