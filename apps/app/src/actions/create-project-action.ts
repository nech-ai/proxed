"use server";
import {
	revalidatePath as revalidatePathFunc,
	revalidateTag,
} from "next/cache";
import { authActionClient } from "./safe-action";
import { createProjectSchema } from "./schema";
import { createProject } from "@proxed/supabase/mutations";

export const createProjectAction = authActionClient
	.schema(createProjectSchema)
	.action(
		async ({
			parsedInput: {
				deviceCheckId,
				name,
				description,
				bundleId,
				keyId,
				revalidatePath,
			},
			ctx: { supabase, user },
		}) => {
			if (!user?.team_id) {
				return;
			}

			const { data: project } = await createProject(supabase, {
				name,
				description,
				bundleId,
				deviceCheckId,
				teamId: user.team_id,
				keyId,
			});

			revalidateTag(`projects_${user.team_id}`);

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return project;
		},
	);
