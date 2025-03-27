"use server";

import { authActionClient } from "./safe-action";
import { updateProjectSchemaSchema } from "./schema";
import { updateProjectSchema } from "@proxed/supabase/mutations";
import { revalidateTag } from "next/cache";
import { LogEvents } from "@proxed/analytics";

export const updateProjectSchemaAction = authActionClient
	.schema(updateProjectSchemaSchema)
	.metadata({
		name: "updateProjectSchemaAction",
		track: LogEvents.UpdateProjectSchema,
	})
	.action(
		async ({
			parsedInput: { projectId, schemaConfig },
			ctx: { supabase, user },
		}) => {
			if (!user?.team_id) return;

			const result = await updateProjectSchema(
				supabase,
				projectId,
				schemaConfig,
			);

			revalidateTag(`project_${projectId}`);

			return result.data;
		},
	);
