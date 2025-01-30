import { ChartSelectors } from "@/components/charts/chart-selectors";
import { Charts } from "@/components/charts/charts";
import { ActionBlock } from "@/components/shared/action-block";
import { subWeeks } from "date-fns";
import type { Metadata } from "next";

export const maxDuration = 30;

export const metadata: Metadata = {
	title: "Metrics",
};

const defaultValue = {
	from: subWeeks(new Date(), 1).toISOString(),
	to: new Date().toISOString(),
	period: "daily",
};

export default async function Metrics({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const { from, to } = await searchParams;
	const chartType = "all";
	const value = {
		...(from && { from }),
		...(to && { to }),
	};

	return (
		<div className="container max-w-6xl px-4 py-8">
			<ActionBlock title="Metrics">
				<div className="mb-6">
					<ChartSelectors defaultValue={defaultValue} />
				</div>
				<div className="mb-12">
					<Charts
						value={value}
						defaultValue={defaultValue}
						disabled={false}
						type={chartType}
					/>
				</div>
			</ActionBlock>
		</div>
	);
}
