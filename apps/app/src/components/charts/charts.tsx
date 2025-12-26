"use client";

import { useMetricsParams } from "@/hooks/use-metrics-params";
import { ExecutionsChart } from "./executions-chart";
import { TokensChart } from "./tokens-chart";

type Props = {
	disabled: boolean;
};

export function Charts({ disabled }: Props) {
	const { params } = useMetricsParams();

	switch (params.chart) {
		case "all":
			return <ExecutionsChart disabled={disabled} />;
		case "tokens":
			return <TokensChart disabled={disabled} />;
		default:
			return null;
	}
}
