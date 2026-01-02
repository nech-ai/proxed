"use client";
import type { RouterOutputs } from "@/trpc/types";
import { Badge } from "@proxed/ui/components/badge";
import { ModelBadge } from "@proxed/ui/components/model-badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActionsCell } from "./actions-cell";
import { formatCost } from "@/utils/format-cost";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import {
	getModelBadge,
	getModelDisplayName,
	isModelForProvider,
	type Model,
	type Provider,
} from "@proxed/utils/lib/providers";
import {
	formatTokenPricingLabel,
	getModelPricing,
} from "@proxed/utils/lib/pricing";

export type ExecutionOutput =
	RouterOutputs["executions"]["list"]["data"][number];

export const columns: ColumnDef<ExecutionOutput>[] = [
	{
		header: "Project",
		accessorKey: "project",
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span>{row.original.project?.name ?? "Unknown"}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.project?.bundleId ?? "N/A"}
				</span>
			</div>
		),
	},
	{
		header: "Model",
		accessorKey: "model",
		enableSorting: true,
		cell: ({ row }) => {
			const modelId = row.original.model ?? null;
			const provider = row.original.provider as Provider | undefined;
			const isProviderModel = modelId
				? Boolean(provider && isModelForProvider(modelId, provider))
				: false;
			const displayName = modelId
				? getModelDisplayName(modelId as Model)
				: "Unknown model";
			const badge =
				modelId && isProviderModel
					? getModelBadge(modelId as Model)
					: undefined;
			const pricingLabel =
				modelId && provider && isProviderModel
					? formatTokenPricingLabel(getModelPricing(provider, modelId as Model))
					: null;

			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex flex-col gap-1 min-w-[140px]">
								<div className="flex items-center gap-2">
									<span className="font-medium truncate">{displayName}</span>
									{badge && <ModelBadge badge={badge} />}
								</div>
								{modelId ? (
									<Badge
										variant="outline"
										className="w-fit max-w-[180px] truncate text-xs font-mono"
									>
										{modelId}
									</Badge>
								) : (
									<span className="text-xs text-muted-foreground">
										Unknown model
									</span>
								)}
							</div>
						</TooltipTrigger>
						<TooltipContent className="max-w-[260px]">
							<div className="flex flex-col gap-1 text-xs">
								<span>Model ID: {modelId ?? "Unknown"}</span>
								{pricingLabel ? (
									<span>{pricingLabel}</span>
								) : (
									<span className="text-muted-foreground">
										Pricing unavailable
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
		header: "Provider",
		accessorKey: "provider",
		enableSorting: true,
		cell: ({ row }) => <Badge>{row.original.provider}</Badge>,
	},
	{
		header: "Tokens",
		accessorKey: "totalTokens",
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span>{row.original.totalTokens?.toLocaleString() || 0}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.promptTokens?.toLocaleString() || 0} /{" "}
					{row.original.completionTokens?.toLocaleString() || 0}
				</span>
			</div>
		),
	},
	{
		header: "Cost",
		accessorKey: "totalCost",
		enableSorting: true,
		cell: ({ row }) => {
			const totalCost = row.original.totalCost;
			const promptCost = row.original.promptCost;
			const completionCost = row.original.completionCost;

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
										Prompt / Completion: {rawDollar(promptCost)} /{" "}
										{rawDollar(completionCost)}
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
		accessorKey: "finishReason",
		enableSorting: true,
		cell: ({ row }) => (
			<Badge variant={row.original.errorMessage ? "destructive" : "default"}>
				{row.original.finishReason}
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
