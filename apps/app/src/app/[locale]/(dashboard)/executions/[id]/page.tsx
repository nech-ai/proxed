import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ExecutionDetailsCard } from "@/components/executions/execution-details-card";
import {
	batchPrefetch,
	getQueryClient,
	HydrateClient,
	trpc,
} from "@/trpc/server";

export async function generateMetadata(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const queryClient = getQueryClient();
	batchPrefetch([trpc.executions.byId.queryOptions({ id })]);
	const execution = await queryClient.fetchQuery(
		trpc.executions.byId.queryOptions({ id }),
	);
	if (!execution || !execution.id) {
		notFound();
	}

	return {
		title: `Execution #${execution.id} | Proxed`,
	};
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const { id } = await props.params;
	const queryClient = getQueryClient();
	batchPrefetch([trpc.executions.byId.queryOptions({ id })]);
	const execution = await queryClient.fetchQuery(
		trpc.executions.byId.queryOptions({ id }),
	);

	if (!execution || !execution.id) notFound();

	return (
		<HydrateClient>
			<div className="flex flex-col h-full">
				<PageHeader title="Execution Details" />
				<main className="flex-1 overflow-auto bg-muted/5">
					<div className="container mx-auto px-4 py-8 space-y-6">
						<ExecutionDetailsCard executionId={execution.id} />
					</div>
				</main>
			</div>
		</HydrateClient>
	);
}
