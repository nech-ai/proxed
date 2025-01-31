import { Loading } from "@/components/tables/projects/loading";
import { ErrorFallback } from "@/components/error-fallback";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { searchParamsCache } from "./search-params";
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

export default async function Page(props: {
	params: Promise<{
		searchParams: { [key: string]: string | string[] | undefined };
	}>;
}) {
	const { searchParams } = await props.params;
	const {
		q: query,
		page,
		start,
		end,
		bundleId,
		deviceCheck,
		keyId,
	} = searchParamsCache.parse(searchParams);

	const filter = {
		start,
		end,
		bundleId,
		deviceCheck,
		keyId,
	};

	// @ts-ignore
	const sort = searchParams?.sort?.split(":");

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

			<main className="flex-1 overflow-auto bg-muted/5 w-full max-w-screen-xl mx-auto">
				<ErrorBoundary errorComponent={ErrorFallback}>
					<Suspense fallback={<Loading />} key={loadingKey}>
						<Table filter={filter} page={page} sort={sort} query={query} />
					</Suspense>
				</ErrorBoundary>
			</main>
		</>
	);
}
