"use client";
import type { Database } from "@proxed/supabase/types";
import { Badge } from "@proxed/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActionsCell } from "./actions-cell";
import { formatCost } from "@/utils/format-cost";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@proxed/ui/components/tooltip";

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
				<span>{row.original.total_tokens?.toLocaleString() || 0}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.prompt_tokens?.toLocaleString() || 0} /{" "}
					{row.original.completion_tokens?.toLocaleString() || 0}
				</span>
			</div>
		),
	},
	{
		header: "Cost",
		accessorKey: "total_cost",
		enableSorting: true,
		cell: ({ row }) => {
			const totalCost = row.original.total_cost;
			const promptCost = row.original.prompt_cost;
			const completionCost = row.original.completion_cost;

			const rawDollar = (n?: number | null) =>
				n === null || n === undefined ? "$0.000000" : `$${n.toFixed(6)}`;

			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex flex-col cursor-default">
								<span className="font-medium">{formatCost(totalCost)}</span>
								{(promptCost || completionCost) && (
									<span className="text-muted-foreground text-xs">
										{formatCost(promptCost)} / {formatCost(completionCost)}
									</span>
								)}
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<div className="flex flex-col">
								<span>Total: {rawDollar(totalCost)}</span>
								{(promptCost || completionCost) && (
									<span>
										Prompt / Completion: {rawDollar(promptCost)} / {rawDollar(completionCost)}
									</span>
								)}
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
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
