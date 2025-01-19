"use client";

import { useCallback } from "react";
import { updateProjectSchemaAction } from "@/actions/update-project-schema-action";
import type { SchemaConfig } from "@proxed/structure";

export function useUpdateProjectSchema() {
	const updateSchema = useCallback(
		async (params: {
			projectId: string;
			schemaConfig: SchemaConfig;
		}) => {
			try {
				await updateProjectSchemaAction(params);
			} catch (error) {
				console.error("Failed to update schema:", error);
			}
		},
		[],
	);

	return { updateSchema };
}
