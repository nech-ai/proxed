import { Suspense } from "react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { PageHeader } from "@/components/layout/page-header";
import { VaultFilters } from "@/components/vault/vault-filters";
import { VaultGrid } from "@/components/vault/vault-grid";
import { VaultLoading } from "@/components/vault/vault-loading";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { loadVaultFilterParams } from "@/hooks/use-vault-filter-params";

export const metadata: Metadata = {
	title: "Vault | Proxed",
};

type PageProps = {
	searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
	const parsedSearchParams = await searchParams;
	const filter = loadVaultFilterParams(parsedSearchParams);

	prefetch(
		trpc.vault.list.infiniteQueryOptions(
			{
				filter: {
					start: filter.start ?? undefined,
					end: filter.end ?? undefined,
					projectId: filter.projectId ?? undefined,
				},
				searchQuery: filter.q ?? undefined,
				pageSize: 30,
				signedUrlExpiresIn: 600,
			},
			{
				getNextPageParam: ({ meta }) => meta?.cursor,
			},
		),
	);

	const loadingKey = JSON.stringify(filter);

	return (
		<HydrateClient>
			<PageHeader
				title="Vault"
				description="Browse all saved generated files"
			>
				<VaultFilters />
			</PageHeader>

			<main className="flex-1 overflow-auto bg-muted/5">
				<div className="container mx-auto px-4 py-8">
					<ErrorBoundary errorComponent={ErrorFallback}>
						<Suspense fallback={<VaultLoading />} key={loadingKey}>
							<VaultGrid />
						</Suspense>
					</ErrorBoundary>
				</div>
			</main>
		</HydrateClient>
	);
}
