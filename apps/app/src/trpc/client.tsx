"use client";

import { createClient as createSupabaseClient } from "@proxed/supabase/client";
import type { QueryClient } from "@tanstack/react-query";
import { isServer, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import type { AppRouterClient } from "./types";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouterClient>();

const transformer = superjson;

let browserQueryClient: QueryClient;

function getQueryClient() {
	if (isServer) return makeQueryClient();
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

const apiBaseUrl =
	process.env.NEXT_PUBLIC_API_URL ??
	process.env.NEXT_PUBLIC_PROXY_API_URL ??
	(process.env.NODE_ENV === "development"
		? "http://localhost:3002"
		: "https://api.proxed.ai");

export function TRPCReactProvider(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouterClient>({
			links: [
				httpBatchLink<AppRouterClient>({
					url: `${apiBaseUrl}/trpc`,
					transformer,
					async headers() {
						const supabase = createSupabaseClient();
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
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{props.children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
