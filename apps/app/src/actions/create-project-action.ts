"use server";
import {
	revalidatePath as revalidatePathFunc,
	revalidateTag,
} from "next/cache";
import { authActionClient } from "./safe-action";
import { createProjectSchema } from "./schema";
import { createProject } from "@proxed/supabase/mutations";
import { LogEvents } from "@proxed/analytics";

export const createProjectAction = authActionClient
	.schema(createProjectSchema)
	.metadata({
		name: "createProjectAction",
		requiredFeature: "create_project",
		track: LogEvents.CreateProject,
	})
	.action(
		async ({
			parsedInput: { name, description, bundleId, revalidatePath },
			ctx: { supabase, user },
		}) => {
			if (!user?.team_id) {
				return;
			}

			const { data: project } = await createProject(supabase, {
				name,
				description,
				bundleId,
				teamId: user.team_id,
			});

			revalidateTag(`projects_${user.team_id}`);

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return project;
		},
	);
