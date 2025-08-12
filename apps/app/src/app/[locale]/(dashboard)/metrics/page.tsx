import { ChartSelectors } from "@/components/charts/chart-selectors";
import { Charts } from "@/components/charts/charts";
import { ActionBlock } from "@/components/shared/action-block";
import { subWeeks } from "date-fns";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { cookies } from "next/headers";
import { Cookies as CookieKeys } from "@/utils/constants";

export const maxDuration = 30;

export const metadata: Metadata = {
	title: "Metrics | Proxed",
};

const defaultValue = {
	from: subWeeks(new Date(), 1).toISOString(),
	to: new Date().toISOString(),
	period: "daily",
};

export default async function Metrics({
	searchParams,
}: {
	searchParams: any;
}) {
	const { from, to } = await searchParams;
	const cookieStore = await cookies();
	const chartType = (cookieStore.get(CookieKeys.ChartType)?.value ?? "all") as
		| "all"
		| "tokens";
	const value = {
		...(from && { from }),
		...(to && { to }),
	};

	return (
		<>
			<PageHeader
				title="Metrics"
				description="Analytics and performance insights"
			/>
			<div className="container mx-auto px-4 py-8">
				<ActionBlock title="Executions">
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
		</>
	);
}
