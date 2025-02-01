"use client";

import React from "react";

interface ExecutionMetricsProps {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	promptCost: number;
	completionCost: number;
	totalCost: number;
}

// Helper component to render a single metric value.
const MetricItem: React.FC<{ label: string; value: React.ReactNode }> = ({
	label,
	value,
}) => (
	<div className="flex flex-col items-center">
		<span className="text-xs text-muted-foreground">{label}</span>
		<span className="font-medium">{value}</span>
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
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div className="p-4 border rounded-lg bg-background">
				<p className="mb-1 text-sm text-muted-foreground">Tokens Usage</p>
				<div className="grid grid-cols-3 gap-2">
					<MetricItem label="Prompt" value={promptTokens} />
					<MetricItem label="Completion" value={completionTokens} />
					<MetricItem label="Total" value={totalTokens} />
				</div>
			</div>
			<div className="p-4 border rounded-lg bg-background">
				<p className="mb-1 text-sm text-muted-foreground">Costs (USD)</p>
				<div className="grid grid-cols-3 gap-2">
					<MetricItem label="Prompt" value={`$${promptCost}`} />
					<MetricItem label="Completion" value={`$${completionCost}`} />
					<MetricItem label="Total" value={`$${totalCost}`} />
				</div>
			</div>
		</div>
	);
}
