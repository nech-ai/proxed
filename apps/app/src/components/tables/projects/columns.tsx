"use client";
import type { Database } from "@proxed/supabase/types";
import { Badge } from "@proxed/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActionsCell } from "./actions-cell";

export type ProjectOutput = Database["public"]["Tables"]["projects"]["Row"] & {
	device_check: {
		id: string;
		name: string;
	} | null;
};

export const columns: ColumnDef<ProjectOutput>[] = [
	{
		header: "Name",
		accessorKey: "name",
		enableSorting: true,
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
		header: "Key ID",
		accessorKey: "key_id",
		enableSorting: true,
		cell: ({ row }) => <Badge variant="outline">{row.original.key_id}</Badge>,
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
