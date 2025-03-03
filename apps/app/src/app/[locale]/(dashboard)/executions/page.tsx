import { Loading } from "@/components/tables/executions/loading";
import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsLoader } from "./search-params";
import { SearchFilter } from "@/components/tables/executions/search-filter";
import { Table } from "@/components/tables/executions";
import { ColumnVisibility } from "@/components/tables/executions/column-visibility";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

export const metadata: Metadata = {
	title: "Executions | Proxed",
};

type PageProps = {
	searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
	const {
		q: query,
		page,
		sort: sortArray,
		start,
		end,
		projectId,
		provider,
		model,
		finishReason,
		deviceCheckId,
		keyId,
	} = await searchParamsLoader(searchParams);

	const filter = {
		start,
		end,
		projectId,
		provider,
		model,
		finishReason,
		deviceCheckId,
		keyId,
	};

	const sort = sortArray?.split(":");

	const loadingKey = JSON.stringify({
		page,
		filter,
		sort,
		query,
	});

	return (
		<>
			<PageHeader
				title="Executions"
				description="View and manage all AI model executions"
			>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-3">
						<SearchFilter
							placeholder="Search executions..."
							className="w-full md:w-auto"
						/>
						<ColumnVisibility className="shrink-0" />
					</div>
				</div>
			</PageHeader>

			<main className="flex-1 overflow-auto bg-muted/5">
				<div className="container mx-auto px-4 py-8">
					<ErrorBoundary errorComponent={ErrorFallback}>
						<Suspense fallback={<Loading />} key={loadingKey}>
							<Table filter={filter} page={page} sort={sort} query={query} />
						</Suspense>
					</ErrorBoundary>
				</div>
			</main>
		</>
	);
}
