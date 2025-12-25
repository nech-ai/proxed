"use client";

import { updateColumnVisibilityAction } from "@/actions/update-column-visibility-action";
import { useExecutionsStore } from "@/store/executions";
import { useUserContext } from "@/store/user/hook";
import { Cookies } from "@/utils/constants";
import { Spinner } from "@proxed/ui/components/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@proxed/ui/components/table";
import { cn } from "@proxed/ui/utils";
import {
	type ColumnDef,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect } from "react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { DataTableHeader } from "./data-table-header";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	fetchNextPage: () => void;
	initialColumnVisibility: VisibilityState;
}

export function DataTable<TData, TValue>({
	columns,
	data: initialData,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
	const [data, setData] = useState(initialData);
	const { ref, inView } = useInView();
	const { dateFormat } = useUserContext((state) => state.data);

	const { setColumns } = useExecutionsStore();

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		initialColumnVisibility ?? {},
	);

	const table = useReactTable({
		// @ts-expect-error
		getRowId: (row) => row.id,
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		meta: {
			dateFormat,
		},
		state: {
			columnVisibility,
		},
	});

	useEffect(() => {
		// @ts-expect-error
		setColumns(table.getAllLeafColumns());
	}, [columnVisibility]);

	useEffect(() => {
		updateColumnVisibilityAction({
			key: Cookies.ExecutionsColumns,
			data: columnVisibility,
		});
	}, [columnVisibility]);

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	useEffect(() => {
		setData(initialData);
	}, [initialData]);

	return (
		<div className="rounded-md border">
			<Table>
				<DataTableHeader table={table} />

				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} className="group h-[40px] md:h-[45px]">
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={cn(
											"py-2 group-first:rounded-t-md group-last:rounded-b-md",
										)}
									>
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

			{hasNextPage && (
				<div className="mt-6 flex items-center justify-center" ref={ref}>
					<div className="flex items-center space-x-2 px-6 py-5">
						<Spinner />
						<span className="text-[#606060] text-sm">Loading more...</span>
					</div>
				</div>
			)}
		</div>
	);
}
