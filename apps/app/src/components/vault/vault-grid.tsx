"use client";

import { useVaultFilterParams } from "@/hooks/use-vault-filter-params";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { Spinner } from "@proxed/ui/components/spinner";
import { VaultItem } from "./vault-item";
import { VaultEmptyState } from "./vault-empty-state";

export function VaultGrid() {
	const trpc = useTRPC();
	const { filter, hasFilters } = useVaultFilterParams();
	const { ref, inView } = useInView();

	const infiniteQueryOptions = trpc.vault.list.infiniteQueryOptions(
		{
			pageSize: 30,
			searchQuery: filter.q ?? undefined,
			filter: {
				start: filter.start ?? undefined,
				end: filter.end ?? undefined,
				projectId: filter.projectId ?? undefined,
			},
			signedUrlExpiresIn: 600,
		},
		{
			getNextPageParam: ({ meta }) => meta?.cursor,
		},
	);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(infiniteQueryOptions);

	const items = useMemo(
		() => data?.pages.flatMap((page) => page.data) ?? [],
		[data],
	);

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			void fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (!items.length) {
		return <VaultEmptyState hasFilters={hasFilters} />;
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{items.map((item) => (
					<VaultItem key={item.id} item={item} />
				))}
			</div>

			{hasNextPage && (
				<div className="flex items-center justify-center" ref={ref}>
					<div className="flex items-center space-x-2 px-6 py-5">
						<Spinner />
						<span className="text-[#606060] text-sm">Loading more...</span>
					</div>
				</div>
			)}
		</div>
	);
}
