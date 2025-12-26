import { ChartSelectors } from "@/components/charts/chart-selectors";
import { Charts } from "@/components/charts/charts";
import { ActionBlock } from "@/components/shared/action-block";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { PageHeader } from "@/components/layout/page-header";
import { HydrateClient } from "@/trpc/server";

export const maxDuration = 30;

export const metadata: Metadata = {
	title: "Metrics | Proxed",
};

export default async function Metrics({
	searchParams: _searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	return (
		<HydrateClient>
			<PageHeader
				title="Metrics"
				description="Analytics and performance insights"
			/>
			<div className="container mx-auto px-4 py-8">
				<ActionBlock title="Executions">
					<div className="mb-6">
						<ChartSelectors />
					</div>
					<div className="mb-12">
						<Charts disabled={false} />
					</div>
				</ActionBlock>
			</div>
		</HydrateClient>
	);
}
