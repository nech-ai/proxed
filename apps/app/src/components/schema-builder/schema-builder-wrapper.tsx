"use client";

import { toast } from "sonner";
import { SchemaBuilder } from "./schema-builder";
import type { JsonSchema } from "@proxed/structure";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const defaultSchema = {
	type: "object",
	fields: {},
} as const;

const schemaConfigValidator = z.object({
	type: z.string(),
	fields: z.record(z.string(), z.any()).default({}),
});

interface SchemaBuilderWrapperProps {
	projectId: string;
}

export function SchemaBuilderWrapper({ projectId }: SchemaBuilderWrapperProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { data: project } = useQuery(
		trpc.projects.byId.queryOptions({ id: projectId }),
	);

	const updateSchema = useMutation(
		trpc.projects.updateSchema.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.projects.byId.queryKey({ id: projectId }),
				});
			},
		}),
	);

	async function handleSchemaChange(schema: JsonSchema) {
		try {
			await updateSchema.mutateAsync({
				projectId,
				schemaConfig: schema,
			});
		} catch (_error) {
			toast.error("Failed to update schema");
		}
	}

	if (!project) {
		return null;
	}

	const schemaConfig = schemaConfigValidator.safeParse(project.schemaConfig)
		.success
		? (project.schemaConfig as unknown as JsonSchema)
		: (defaultSchema as JsonSchema);

	return (
		<SchemaBuilder initialSchema={schemaConfig} onChange={handleSchemaChange} />
	);
}
