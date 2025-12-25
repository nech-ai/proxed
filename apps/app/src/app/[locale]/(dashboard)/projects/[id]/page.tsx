import { notFound } from "next/navigation";
import { ProjectDetails } from "@/components/projects/project-details";
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
	batchPrefetch([trpc.projects.byId.queryOptions({ id })]);
	const project = await queryClient.fetchQuery(
		trpc.projects.byId.queryOptions({ id }),
	);
	if (!project || !project.id) {
		notFound();
	}

	return {
		title: `${project.name} | Proxed`,
	};
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const { id } = await props.params;
	const queryClient = getQueryClient();
	batchPrefetch([
		trpc.projects.byId.queryOptions({ id }),
		trpc.deviceChecks.list.queryOptions(),
		trpc.providerKeys.list.queryOptions(),
	]);
	const project = await queryClient.fetchQuery(
		trpc.projects.byId.queryOptions({ id }),
	);

	if (!project || !project.id) {
		notFound();
	}

	return (
		<HydrateClient>
			<ProjectDetails projectId={project.id} />
		</HydrateClient>
	);
}
