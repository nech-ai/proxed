"use client";

import { toast } from "sonner";
import { SchemaBuilder } from "./schema-builder";
import { updateProjectSchemaAction } from "@/actions/update-project-schema-action";
import type { JsonSchema } from "@proxed/structure";

interface SchemaBuilderWrapperProps {
	projectId: string;
	initialSchema: JsonSchema;
}

export function SchemaBuilderWrapper({
	projectId,
	initialSchema,
}: SchemaBuilderWrapperProps) {
	async function handleSchemaChange(schema: JsonSchema) {
		try {
			const result = await updateProjectSchemaAction({
				projectId,
				schemaConfig: schema,
			});

			if (result?.data === null) {
				toast.error("Failed to update schema");
			}
		} catch (error) {
			toast.error("Failed to update schema");
		}
	}

	return (
		<SchemaBuilder
			initialSchema={initialSchema}
			onChange={handleSchemaChange}
		/>
	);
}
