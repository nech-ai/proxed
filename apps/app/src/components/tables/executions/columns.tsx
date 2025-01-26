"use client";
import type { Database } from "@proxed/supabase/types";
import { Badge } from "@proxed/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActionsCell } from "./actions-cell";

export type ExecutionOutput =
	Database["public"]["Tables"]["executions"]["Row"] & {
		project: {
			id: string;
			name: string;
			bundle_id: string;
		};
		device_check: {
			id: string;
			name: string;
		};
		key: {
			id: string;
			display_name: string;
		};
	};

export const columns: ColumnDef<ExecutionOutput>[] = [
	{
		header: "Project",
		accessorKey: "project",
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span>{row.original.project.name}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.project.bundle_id}
				</span>
			</div>
		),
	},
	{
		header: "Model",
		accessorKey: "model",
		enableSorting: true,
		cell: ({ row }) => <Badge variant="outline">{row.original.model}</Badge>,
	},
	{
		header: "Provider",
		accessorKey: "provider",
		enableSorting: true,
		cell: ({ row }) => <Badge>{row.original.provider}</Badge>,
	},
	{
		header: "Tokens",
		accessorKey: "total_tokens",
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span>{row.original.total_tokens}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.prompt_tokens} / {row.original.completion_tokens}
				</span>
			</div>
		),
	},
	{
		header: "Cost",
		accessorKey: "total_cost",
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span>${row.original?.total_cost?.toFixed(4)}</span>
				<span className="text-muted-foreground text-sm">
					${row.original.prompt_cost?.toFixed(4)} / $
					{row.original.completion_cost?.toFixed(4)}
				</span>
			</div>
		),
	},
	{
		header: "Status",
		accessorKey: "finish_reason",
		enableSorting: true,
		cell: ({ row }) => (
			<Badge variant={row.original.error_message ? "destructive" : "default"}>
				{row.original.finish_reason}
			</Badge>
		),
	},
	{
		header: "Latency",
		accessorKey: "latency",
		enableSorting: true,
		cell: ({ row }) => `${row.original.latency}ms`,
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
