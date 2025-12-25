import { Loading } from "@/components/tables/executions/loading";
import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { SearchFilter } from "@/components/tables/executions/search-filter";
import { Table } from "@/components/tables/executions";
import { ColumnVisibility } from "@/components/tables/executions/column-visibility";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { cookies } from "next/headers";
import { Cookies as CookieKeys } from "@/utils/constants";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import type { RouterInputs } from "@/trpc/types";
import { loadExecutionsFilterParams } from "@/hooks/use-executions-filter-params";
import { loadSortParams } from "@/hooks/use-sort-params";

export const metadata: Metadata = {
	title: "Executions | Proxed",
};

type PageProps = {
	searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
	const parsedSearchParams = await searchParams;
	const filter = loadExecutionsFilterParams(parsedSearchParams);
	const { sort: sortValue } = loadSortParams(parsedSearchParams);

	type ExecutionListInput = Exclude<RouterInputs["executions"]["list"], void>;
	const sort = sortValue
		? (sortValue.split(":") as ExecutionListInput["sort"])
		: undefined;
	const hasFilters = Object.values({
		start: filter.start,
		end: filter.end,
		projectId: filter.projectId,
		provider: filter.provider,
		model: filter.model,
		finishReason: filter.finishReason,
		deviceCheckId: filter.deviceCheckId,
		keyId: filter.keyId,
	}).some((value) => value !== null);

	const cookieStore = await cookies();
	const initialColumnVisibility = JSON.parse(
		cookieStore.get(CookieKeys.ExecutionsColumns)?.value || "[]",
	);

	prefetch(
		trpc.executions.list.infiniteQueryOptions(
			{
				filter: {
					start: filter.start ?? undefined,
					end: filter.end ?? undefined,
					projectId: filter.projectId ?? undefined,
					provider: filter.provider ?? undefined,
					model: filter.model ?? undefined,
					finishReason: filter.finishReason ?? undefined,
					deviceCheckId: filter.deviceCheckId ?? undefined,
					keyId: filter.keyId ?? undefined,
				},
				sort,
				searchQuery: filter.q ?? undefined,
				pageSize: hasFilters ? 100000 : 50,
			},
			{
				getNextPageParam: ({ meta }) => meta?.cursor,
			},
		),
	);

	const loadingKey = JSON.stringify({
		filter,
		sort,
	});

	return (
		<HydrateClient>
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
							<Table initialColumnVisibility={initialColumnVisibility} />
						</Suspense>
					</ErrorBoundary>
				</div>
			</main>
		</HydrateClient>
	);
}
