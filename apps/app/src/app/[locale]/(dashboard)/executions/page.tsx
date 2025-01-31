import { Loading } from "@/components/tables/executions/loading";
import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsCache } from "./search-params";
import { SearchFilter } from "@/components/tables/executions/search-filter";
import { Table } from "@/components/tables/executions";
import { ColumnVisibility } from "@/components/tables/executions/column-visibility";
import { PageHeader } from "@/components/layout/page-header";

export default async function Page(props: {
	params: Promise<{
		searchParams: { [key: string]: string | string[] | undefined };
	}>;
}) {
	const { searchParams } = await props.params;
	const {
		q: query,
		page,
		start,
		end,
		projectId,
		provider,
		model,
		finishReason,
		deviceCheckId,
		keyId,
	} = searchParamsCache.parse(searchParams);

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

	// @ts-ignore
	const sort = searchParams?.sort?.split(":");

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

			<main className="flex-1 overflow-auto bg-muted/5 w-full max-w-screen-xl mx-auto">
				<ErrorBoundary errorComponent={ErrorFallback}>
					<Suspense fallback={<Loading />} key={loadingKey}>
						<Table filter={filter} page={page} sort={sort} query={query} />
					</Suspense>
				</ErrorBoundary>
			</main>
		</>
	);
}
