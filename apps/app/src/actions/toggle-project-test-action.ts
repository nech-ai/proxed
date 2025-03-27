"use server";

import { authActionClient } from "./safe-action";
import { toggleProjectTestModeSchema } from "./schema";
import { updateProject } from "@proxed/supabase/mutations";
import {
	revalidateTag,
	revalidatePath as revalidatePathFunc,
} from "next/cache";
import { LogEvents } from "@proxed/analytics";

export const toggleProjectTestAction = authActionClient
	.schema(toggleProjectTestModeSchema)
	.metadata({
		name: "toggleProjectTestAction",
		track: LogEvents.ToggleProjectTest,
	})
	.action(
		async ({
			parsedInput: { projectId, testMode, revalidatePath },
			ctx: { supabase },
		}) => {
			const result = await updateProject(supabase, projectId, {
				test_mode: testMode,
			});

			revalidateTag(`project_${projectId}`);
			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}
			return result.data;
		},
	);
