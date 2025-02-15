"use client";
import type { Database } from "@proxed/supabase/types";
import { Badge } from "@proxed/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActionsCell } from "./actions-cell";
import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@proxed/ui/lib/utils";

export type ProjectOutput = Database["public"]["Tables"]["projects"]["Row"] & {
	device_check: {
		id: string;
		name: string;
	} | null;
	key: {
		id: string;
		display_name: string;
	} | null;
};

export const columns: ColumnDef<ProjectOutput>[] = [
	{
		header: "Name",
		accessorKey: "name",
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<span
					className={cn(
						row.original.test_mode &&
							"text-yellow-600 dark:text-yellow-400 font-medium",
					)}
				>
					{row.getValue("name")}
				</span>
				{row.original.test_mode && (
					<AlertTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
				)}
			</div>
		),
	},
	{
		header: "Description",
		accessorKey: "description",
		enableSorting: true,
	},
	{
		header: "Bundle ID",
		accessorKey: "bundle_id",
		enableSorting: true,
	},
	{
		header: "Device Check",
		accessorKey: "device_check",
		enableSorting: true,
		accessorFn: (row) => row.device_check?.name || "N/A",
	},
	{
		header: "Key",
		accessorKey: "key",
		enableSorting: true,
		cell: ({ row }) => (
			<Badge variant="outline">{row.original.key?.display_name}</Badge>
		),
	},
	{
		header: "Test Mode",
		accessorKey: "test_mode",
		enableSorting: true,
		cell: ({ row }) =>
			row.original.test_mode ? (
				<Badge
					variant="outline"
					className="border-yellow-500 text-yellow-600 dark:text-yellow-400"
				>
					Enabled
				</Badge>
			) : null,
	},
	{
		header: "Status",
		accessorKey: "is_active",
		enableSorting: true,
		cell: ({ row }) => (
			<Badge variant={row.original.is_active ? "default" : "destructive"}>
				{row.original.is_active ? "Active" : "Inactive"}
			</Badge>
		),
	},
	{
		header: "Created At",
		accessorKey: "created_at",
		enableSorting: true,
		cell: ({ row }) =>
			format(new Date(row.original.created_at), "yyyy-MM-dd HH:mm:ss"),
	},
	{
		header: "",
		accessorKey: "actions",
		cell: ({ row }) => <ActionsCell id={row.original.id} />,
	},
];
