"use client";

import { useCallback } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import type { JsonSchema } from "@proxed/structure";

export function useUpdateProjectSchema() {
	const trpc = useTRPC();
	const updateSchemaMutation = useMutation(
		trpc.projects.updateSchema.mutationOptions(),
	);
	const updateSchema = useCallback(
		async (params: { projectId: string; schemaConfig: JsonSchema }) => {
			try {
				await updateSchemaMutation.mutateAsync(params);
			} catch (error) {
				console.error("Failed to update schema:", error);
			}
		},
		[updateSchemaMutation],
	);

	return { updateSchema };
}
