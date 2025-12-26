"use client";
import type { RouterOutputs } from "@/trpc/types";
import { Badge } from "@proxed/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActionsCell } from "./actions-cell";
import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@proxed/ui/lib/utils";

export type ProjectOutput = RouterOutputs["projects"]["list"]["data"][number];

export const columns: ColumnDef<ProjectOutput>[] = [
	{
		header: "Name",
		accessorKey: "name",
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<span
					className={cn(
						row.original.testMode &&
							"text-yellow-600 dark:text-yellow-400 font-medium",
					)}
				>
					{row.getValue("name")}
				</span>
				{row.original.testMode && (
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
		accessorKey: "bundleId",
		enableSorting: true,
	},
	{
		header: "Device Check",
		accessorKey: "deviceCheck",
		enableSorting: true,
		accessorFn: (row) => row.deviceCheck?.name || "N/A",
	},
	{
		header: "Key",
		accessorKey: "key",
		enableSorting: true,
		cell: ({ row }) => (
			<Badge variant="outline">{row.original.key?.displayName}</Badge>
		),
	},
	{
		header: "Test Mode",
		accessorKey: "testMode",
		enableSorting: true,
		cell: ({ row }) =>
			row.original.testMode ? (
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
		accessorKey: "isActive",
		enableSorting: true,
		cell: ({ row }) => (
			<Badge variant={row.original.isActive ? "default" : "destructive"}>
				{row.original.isActive ? "Active" : "Inactive"}
			</Badge>
		),
	},
	{
		header: "Created At",
		accessorKey: "createdAt",
		enableSorting: true,
		cell: ({ row }) =>
			format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm:ss"),
	},
	{
		header: "",
		accessorKey: "actions",
		cell: ({ row }) => <ActionsCell id={row.original.id} />,
	},
];
