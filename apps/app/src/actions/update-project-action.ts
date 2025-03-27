"use server";

import { authActionClient } from "./safe-action";
import { updateProjectSchema } from "./schema";
import { updateProject } from "@proxed/supabase/mutations";
import { revalidateTag } from "next/cache";
import { LogEvents } from "@proxed/analytics";

export const updateProjectAction = authActionClient
	.schema(updateProjectSchema)
	.metadata({
		name: "updateProjectAction",
		track: LogEvents.UpdateProject,
	})
	.action(async ({ parsedInput: data, ctx: { supabase } }) => {
		const result = await updateProject(supabase, data.id, {
			name: data.name,
			description: data.description,
			bundle_id: data.bundleId,
			device_check_id: data.deviceCheckId,
			key_id: data.keyId,
			system_prompt: data.systemPrompt,
			default_user_prompt: data.defaultUserPrompt,
			model: data.model,
		});

		revalidateTag(`project_${data.id}`);
		return result.data;
	});
