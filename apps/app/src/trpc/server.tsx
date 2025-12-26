import "server-only";

import { createClient as createSupabaseClient } from "@proxed/supabase/server";
import type { QueryClient } from "@tanstack/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import {
	createTRPCOptionsProxy,
	type ResolverDef,
	type TRPCInfiniteQueryOptions,
	type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import type { AppRouterClient } from "./types";

const apiBaseUrl =
	process.env.NEXT_PUBLIC_API_URL ??
	process.env.NEXT_PUBLIC_PROXY_API_URL ??
	(process.env.NODE_ENV === "development"
		? "http://localhost:3002"
		: "https://api.proxed.ai");

const transformer = superjson;

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouterClient>({
	queryClient: getQueryClient,
	client: createTRPCClient<AppRouterClient>({
		links: [
			httpBatchLink<AppRouterClient>({
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

type TRPCQueryOptionsOut = ReturnType<TRPCQueryOptions<ResolverDef>>;
type TRPCInfiniteQueryOptionsOut = ReturnType<
	TRPCInfiniteQueryOptions<ResolverDef>
>;
type PrefetchOptions = TRPCQueryOptionsOut | TRPCInfiniteQueryOptionsOut;

type QueryKeyMeta = { type?: "query" | "infinite"; input?: unknown };

function isQueryKeyMeta(value: unknown): value is QueryKeyMeta {
	return typeof value === "object" && value !== null && "type" in value;
}

function isInfiniteQueryOptions(
	queryOptions: PrefetchOptions,
): queryOptions is TRPCInfiniteQueryOptionsOut {
	const meta = queryOptions.queryKey[1];
	return isQueryKeyMeta(meta) && meta.type === "infinite";
}

export function prefetch(queryOptions: PrefetchOptions) {
	const queryClient = getQueryClient();

	if (isInfiniteQueryOptions(queryOptions)) {
		void queryClient.prefetchInfiniteQuery(queryOptions);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}

export function batchPrefetch(queryOptionsArray: PrefetchOptions[]) {
	const queryClient = getQueryClient();

	for (const queryOptions of queryOptionsArray) {
		if (isInfiniteQueryOptions(queryOptions)) {
			void queryClient.prefetchInfiniteQuery(queryOptions);
		} else {
			void queryClient.prefetchQuery(queryOptions);
		}
	}
}
