import "server-only";

import type { AppRouter } from "@proxed/api/trpc/routers/_app";
import { createClient as createSupabaseClient } from "@proxed/supabase/server";
import type { QueryClient } from "@tanstack/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import {
	createTRPCOptionsProxy,
	type ResolverDef,
	type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";

const apiBaseUrl =
	process.env.NEXT_PUBLIC_API_URL ??
	process.env.NEXT_PUBLIC_PROXY_API_URL ??
	(process.env.NODE_ENV === "development"
		? "http://localhost:3002"
		: "https://api.proxed.ai");

const transformer = superjson as any;

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
	queryClient: getQueryClient,
	client: createTRPCClient({
		links: [
			httpBatchLink({
				url: `${apiBaseUrl}/trpc`,
				transformer,
				async headers() {
					const supabase = await createSupabaseClient();
					const {
						data: { session },
					} = await supabase.auth.getSession();

					if (!session?.access_token) return {};

					return {
						Authorization: `Bearer ${session.access_token}`,
					};
				},
			}),
			loggerLink({
				enabled: (opts) =>
					process.env.NODE_ENV === "development" ||
					(opts.direction === "down" && opts.result instanceof Error),
			}),
		],
	}),
});

export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const dehydratedState = dehydrate(queryClient, {
		shouldDehydrateQuery: (query) => query.state.status === "success",
	});
	return (
		<HydrationBoundary state={dehydratedState}>
			{props.children}
		</HydrationBoundary>
	);
}

type PrefetchInfiniteOptions = Parameters<
	QueryClient["prefetchInfiniteQuery"]
>[0];

export function prefetch<T extends ReturnType<TRPCQueryOptions<ResolverDef>>>(
	queryOptions: T,
) {
	const queryClient = getQueryClient();

	if (queryOptions.queryKey[1]?.type === "infinite") {
		void queryClient.prefetchInfiniteQuery(
			queryOptions as unknown as PrefetchInfiniteOptions,
		);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}

export function batchPrefetch<
	T extends ReturnType<TRPCQueryOptions<ResolverDef>>,
>(queryOptionsArray: T[]) {
	const queryClient = getQueryClient();

	for (const queryOptions of queryOptionsArray) {
		if (queryOptions.queryKey[1]?.type === "infinite") {
			void queryClient.prefetchInfiniteQuery(
				queryOptions as unknown as PrefetchInfiniteOptions,
			);
		} else {
			void queryClient.prefetchQuery(queryOptions);
		}
	}
}
