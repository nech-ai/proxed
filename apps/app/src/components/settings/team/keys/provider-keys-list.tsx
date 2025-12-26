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

import type { RouterOutputs } from "@/trpc/types";
import { useUserContext } from "@/store/user/hook";
import { UTCDate } from "@date-fns/utc";
import { Button } from "@proxed/ui/components/button";
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
import { useToast } from "@proxed/ui/hooks/use-toast";
import { format } from "date-fns";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function ProviderKeysList({
	providerKeys,
}: {
	providerKeys: RouterOutputs["providerKeys"]["list"];
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const { toast } = useToast();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { dateFormat } = useUserContext((state) => state.data);
	const dateOnlyFormat = dateFormat?.split(" ")[0] || "yyyy-MM-dd";

	const deleteProviderKey = useMutation(
		trpc.providerKeys.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.providerKeys.list.queryKey(),
				});
				toast({
					title: "Partial Key deleted",
					description: "The Partial Key has been deleted successfully.",
				});
			},
			onError: (error) => {
				toast({
					variant: "destructive",
					title: "Error",
					description: error?.message || "Failed to delete Partial Key",
				});
			},
		}),
	);

	type ProviderKey = RouterOutputs["providerKeys"]["list"][number];
	const columns: ColumnDef<ProviderKey>[] = [
		{
			accessorKey: "displayName",
			header: "Name",
			cell: ({ row }) => (
				<div>
					<strong className="block">{row.original.displayName}</strong>
					<small className="text-muted-foreground">
						{row.original.provider}
					</small>
				</div>
			),
		},
		{
			accessorKey: "id",
			header: "Key ID",
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => (
				<span>
					{row.original.createdAt
						? format(new UTCDate(row.original.createdAt), dateOnlyFormat)
						: "N/A"}
				</span>
			),
		},
		{
			accessorKey: "actions",
			header: "",
			cell: ({ row }) => {
				return (
					<div className="flex flex-row justify-end gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon" variant="ghost">
									<MoreVerticalIcon className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => {
										if (!row.original.id) return;

										const loadingToast = toast({
											variant: "default",
											description: "Deleting partial key...",
										});

										deleteProviderKey.mutate({
											id: row.original.id,
										});

										loadingToast.dismiss();
									}}
								>
									<TrashIcon className="mr-2 size-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: providerKeys,
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
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
