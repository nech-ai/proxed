"use server";

import { createDeviceCheck } from "@proxed/supabase/mutations";
import { authActionClient } from "./safe-action";
import { createDeviceCheckSchema } from "./schema";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { redirect } from "next/navigation";

export const createDeviceCheckAction = authActionClient
	.schema(createDeviceCheckSchema)
	.action(
		async ({
			parsedInput: { revalidatePath, redirectTo, ...data },
			ctx: { user, supabase },
		}) => {
			if (!user.team_id) {
				throw new Error("User is not in a team");
			}

			const { data: deviceCheck, error } = await createDeviceCheck(supabase, {
				...data,
				team_id: user.team_id,
				key_id: data.key_id || "",
				name: data.name || "",
				apple_team_id: data.apple_team_id || "",
				private_key_p8: data.private_key_p8 || "",
			});

			if (error) {
				throw new Error("Failed to create device check");
			}

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			if (redirectTo) {
				redirect(redirectTo);
			}

			return deviceCheck;
		},
	);
