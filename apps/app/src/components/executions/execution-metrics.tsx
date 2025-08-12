"use client";

import React from "react";
import { formatCost } from "@/utils/format-cost";

interface ExecutionMetricsProps {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	promptCost: number;
	completionCost: number;
	totalCost: number;
}

// Helper component to render a single metric value.
const MetricItem: React.FC<{ label: string; value: React.ReactNode; hint?: string }>= ({
	label,
	value,
	hint,
}) => (
	<div className="flex flex-col items-center">
		<span className="text-xs text-muted-foreground">{label}</span>
		<span className="font-medium">{value}</span>
		{hint && (
			<span className="text-[10px] text-muted-foreground/80">{hint}</span>
		)}
	</div>
);

export function ExecutionMetrics({
	promptTokens,
	completionTokens,
	totalTokens,
	promptCost,
	completionCost,
	totalCost,
}: ExecutionMetricsProps) {
	const rawDollar = (n?: number | null) =>
		n === null || n === undefined ? "$0.000000" : `$${n.toFixed(6)}`;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div className="p-4 border rounded-lg bg-background">
				<p className="mb-1 text-sm text-muted-foreground">Tokens Usage</p>
				<div className="grid grid-cols-3 gap-2">
					<MetricItem label="Prompt" value={promptTokens.toLocaleString()} />
					<MetricItem
						label="Completion"
						value={completionTokens.toLocaleString()}
					/>
					<MetricItem label="Total" value={totalTokens.toLocaleString()} />
				</div>
			</div>
			<div className="p-4 border rounded-lg bg-background">
				<p className="mb-1 text-sm text-muted-foreground">Costs</p>
				<div className="grid grid-cols-3 gap-2">
					<MetricItem label="Prompt" value={formatCost(promptCost)} hint={rawDollar(promptCost)} />
					<MetricItem label="Completion" value={formatCost(completionCost)} hint={rawDollar(completionCost)} />
					<MetricItem label="Total" value={formatCost(totalCost)} hint={rawDollar(totalCost)} />
				</div>
			</div>
		</div>
	);
}
