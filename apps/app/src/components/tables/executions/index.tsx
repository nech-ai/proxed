"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useExecutionsFilterParams } from "@/hooks/use-executions-filter-params";
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
	const { filter, hasFilters } = useExecutionsFilterParams();
	const { params } = useSortParams();
	const deferredSearch = useDeferredValue(filter.q);

	type ExecutionListInput = Exclude<RouterInputs["executions"]["list"], void>;
	const sort = params.sort
		? (params.sort.split(":") as ExecutionListInput["sort"])
		: undefined;

	const infiniteQueryOptions = trpc.executions.list.infiniteQueryOptions(
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
