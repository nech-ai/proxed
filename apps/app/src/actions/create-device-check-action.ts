"use server";

import { createDeviceCheck } from "@proxed/supabase/mutations";
import { authActionClient } from "./safe-action";
import { createDeviceCheckSchema } from "./schema";
import { revalidatePath as revalidatePathFunc } from "next/cache";

export const createDeviceCheckAction = authActionClient
	.schema(createDeviceCheckSchema)
	.action(
		async ({
			parsedInput: { revalidatePath, ...data },
			ctx: { user, supabase },
		}) => {
			if (!user.team_id) {
				throw new Error("User is not in a team");
			}

			const { data: deviceCheck, error } = await createDeviceCheck(supabase, {
				...data,
				team_id: user.team_id,
			});

			if (error) {
				throw new Error("Failed to create device check");
			}

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return deviceCheck;
		},
	);
