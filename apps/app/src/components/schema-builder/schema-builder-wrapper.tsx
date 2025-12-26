"use client";

import { toast } from "sonner";
import { SchemaBuilder } from "./schema-builder";
import type { JsonSchema } from "@proxed/structure";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const defaultSchema: JsonSchema = {
	type: "object",
	fields: {},
};

const schemaTypes = [
	"object",
	"string",
	"number",
	"boolean",
	"array",
	"union",
	"intersection",
	"enum",
	"literal",
	"date",
	"any",
	"unknown",
	"record",
	"branded",
	"promise",
	"lazy",
] as const;

type SchemaType = (typeof schemaTypes)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isSchemaType(value: unknown): value is SchemaType {
	return (
		typeof value === "string" &&
		schemaTypes.some((schemaType) => schemaType === value)
	);
}

function isJsonSchema(value: unknown): value is JsonSchema {
	return isRecord(value) && isSchemaType(value.type);
}

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

	const schemaConfig = isJsonSchema(project.schemaConfig)
		? project.schemaConfig
		: defaultSchema;

	return (
		<SchemaBuilder initialSchema={schemaConfig} onChange={handleSchemaChange} />
	);
}
