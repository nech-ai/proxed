import { ContentHeader } from "@/components/layout/content-header";
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

	const deviceChecks = await getDeviceChecks();
	const keys = await getProviderKeys();
	return (
		<>
			<ContentHeader>
				<div className="flex justify-between gap-4 flex-1 min-w-0 py-6">
					<h1 className="text-lg font-semibold truncate">Projects</h1>
					<SearchFilter placeholder="Search or type filter" />
					<div className="flex items-center gap-2">
						<ColumnVisibility />
						<CreateProjectDialog
							// @ts-ignore
							deviceChecks={deviceChecks?.data ?? []}
							// @ts-ignore
							keys={keys?.data ?? []}
						/>
					</div>
				</div>
			</ContentHeader>

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
