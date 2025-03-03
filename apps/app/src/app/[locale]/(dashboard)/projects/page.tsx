import { Loading } from "@/components/tables/projects/loading";
import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsLoader } from "./search-params";
import { SearchFilter } from "@/components/tables/projects/search-filter";
import { Table } from "@/components/tables/projects";
import { ColumnVisibility } from "@/components/tables/projects/column-visibility";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
	getDeviceChecks,
	getProviderKeys,
} from "@proxed/supabase/cached-queries";
import type { Tables } from "@proxed/supabase/types";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

export const metadata: Metadata = {
	title: "Projects | Proxed",
};

type PageProps = {
	searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
	const {
		q: query,
		page,
		sort: sortArray,
		start,
		end,
		bundleId,
		deviceCheck,
		keyId,
	} = await searchParamsLoader(searchParams);

	const filter = {
		start,
		end,
		bundleId,
		deviceCheck,
		keyId,
	};

	const sort = sortArray?.split(":");

	const loadingKey = JSON.stringify({
		page,
		filter,
		sort,
		query,
	});

	const [deviceChecksData, keysData] = await Promise.all([
		getDeviceChecks(),
		getProviderKeys(),
	]);

	const deviceChecks =
		deviceChecksData?.data ?? ([] as Tables<"device_checks">[]);
	const keys = keysData?.data ?? ([] as Tables<"provider_keys">[]);

	return (
		<>
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
							<Table filter={filter} page={page} sort={sort} query={query} />
						</Suspense>
					</ErrorBoundary>
				</div>
			</main>
		</>
	);
}
