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

import type { Tables } from "@proxed/supabase/types";
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
import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { deleteProviderKeyAction } from "@/actions/delete-provider-key-action";
import { useAction } from "next-safe-action/hooks";

export function ProviderKeysList({
	providerKeys,
}: {
	providerKeys: Partial<Tables<"provider_keys">>[];
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const { toast } = useToast();

	const deleteProviderKey = useAction(deleteProviderKeyAction, {
		onSuccess: () => {
			toast({
				title: "Partial Key deleted",
				description: "The Partial Key has been deleted successfully.",
			});
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description:
					error?.error?.serverError || "Failed to delete Partial Key",
			});
		},
	});

	const columns: ColumnDef<Partial<Tables<"provider_keys">>>[] = [
		{
			accessorKey: "display_name",
			header: "Name",
			cell: ({ row }) => (
				<div>
					<strong className="block">{row.original.display_name}</strong>
					<small className="text-muted-foreground">
						{row.original.provider}
					</small>
				</div>
			),
		},
		{
			accessorKey: "key_id",
			header: "Key ID",
		},
		{
			accessorKey: "created_at",
			header: "Created",
			cell: ({ row }) => (
				<span>
					{row.original.created_at
						? new Date(row.original.created_at).toLocaleDateString()
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

										deleteProviderKey.execute({
											id: row.original.id,
											revalidatePath: "/settings/team/keys",
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
