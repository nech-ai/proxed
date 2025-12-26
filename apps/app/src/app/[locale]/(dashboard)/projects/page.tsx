import { Loading } from "@/components/tables/projects/loading";
import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { SearchFilter } from "@/components/tables/projects/search-filter";
import { Table } from "@/components/tables/projects";
import { ColumnVisibility } from "@/components/tables/projects/column-visibility";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { cookies } from "next/headers";
import { Cookies as CookieKeys } from "@/utils/constants";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import type { RouterInputs } from "@/trpc/types";
import { loadProjectsFilterParams } from "@/hooks/use-projects-filter-params";
import { loadSortParams } from "@/hooks/use-sort-params";

export const metadata: Metadata = {
	title: "Projects | Proxed",
};

type PageProps = {
	searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
	const parsedSearchParams = await searchParams;
	const filter = loadProjectsFilterParams(parsedSearchParams);
	const { sort: sortValue } = loadSortParams(parsedSearchParams);

	type ProjectsListInput = Exclude<RouterInputs["projects"]["list"], void>;
	const sort = sortValue
		? (sortValue.split(":") as ProjectsListInput["sort"])
		: undefined;
	const hasFilters = Object.values({
		start: filter.start,
		end: filter.end,
		bundleId: filter.bundleId,
		deviceCheck: filter.deviceCheck,
		keyId: filter.keyId,
	}).some((value) => value !== null);

	const cookieStore = await cookies();
	const initialColumnVisibility = JSON.parse(
		cookieStore.get(CookieKeys.ProjectsColumns)?.value || "[]",
	);

	prefetch(
		trpc.projects.list.infiniteQueryOptions(
			{
				filter: {
					start: filter.start ?? undefined,
					end: filter.end ?? undefined,
					bundleId: filter.bundleId ?? undefined,
					deviceCheckId: filter.deviceCheck ?? undefined,
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
				title="Projects"
				description="Manage your AI projects and configurations"
			>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-3">
						<SearchFilter
							placeholder="Search projects..."
							className="w-full md:w-auto"
						/>
						<ColumnVisibility className="shrink-0" />
					</div>
					<CreateProjectDialog />
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
