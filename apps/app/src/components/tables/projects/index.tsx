"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useProjectsFilterParams } from "@/hooks/use-projects-filter-params";
import { useSortParams } from "@/hooks/use-sort-params";
import { useTRPC } from "@/trpc/client";
import { useDeferredValue, useMemo } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import type { VisibilityState } from "@tanstack/react-table";
import type { RouterInputs } from "@/trpc/types";

const pageSize = 50;
const maxItems = 100000;

type Props = {
	initialColumnVisibility: VisibilityState;
};

export function Table({ initialColumnVisibility }: Props) {
	const trpc = useTRPC();
	const { filter, hasFilters } = useProjectsFilterParams();
	const { params } = useSortParams();
	const deferredSearch = useDeferredValue(filter.q);

	type ProjectsListInput = Exclude<RouterInputs["projects"]["list"], void>;
	const sort = params.sort
		? (params.sort.split(":") as ProjectsListInput["sort"])
		: undefined;

	const infiniteQueryOptions = trpc.projects.list.infiniteQueryOptions(
		{
			filter: {
				start: filter.start ?? undefined,
				end: filter.end ?? undefined,
				bundleId: filter.bundleId ?? undefined,
				deviceCheckId: filter.deviceCheck ?? undefined,
				keyId: filter.keyId ?? undefined,
			},
			sort,
			searchQuery: deferredSearch ?? undefined,
			pageSize: hasFilters ? maxItems : pageSize,
		},
		{
			getNextPageParam: ({ meta }) => meta?.cursor,
		},
	);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(infiniteQueryOptions);

	const rows = useMemo(
		() => data.pages.flatMap((page) => page.data ?? []),
		[data],
	);

	return (
		<DataTable
			initialColumnVisibility={initialColumnVisibility}
			columns={columns}
			data={rows}
			fetchNextPage={fetchNextPage}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
		/>
	);
}
