import { getExecution } from "@proxed/supabase/cached-queries";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ExecutionDetailsCard } from "@/components/executions/execution-details-card";

export default async function Page(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const { data: execution } = await getExecution(id);

	if (!execution || !execution.id) notFound();

	return (
		<div className="flex flex-col h-full">
			<PageHeader title="Execution Details" />
			<main className="flex-1 overflow-auto bg-muted/5">
				<div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
					<ExecutionDetailsCard execution={execution} />
				</div>
			</main>
		</div>
	);
}
