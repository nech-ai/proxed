"use server";

import { updateUser } from "@proxed/supabase/mutations";
import {
	revalidatePath as nextRevalidatePath,
	revalidateTag,
} from "next/cache";
import { authActionClient } from "./safe-action";
import { updateUserSchema } from "./schema";

export const updateUserAction = authActionClient
	.schema(updateUserSchema)
	.action(
		async ({
			parsedInput: { revalidatePath, ...data },
			ctx: { user, supabase },
		}) => {
			await updateUser(supabase, data);

			if (data.full_name) {
				await supabase.auth.updateUser({
					data: {
						full_name: data.full_name,
					},
				});
			}

			if (data.email) {
				await supabase.auth.updateUser({
					data: { email: data.email },
				});
			}

			revalidateTag(`user_${user.id}`);

			if (revalidatePath) {
				nextRevalidatePath(revalidatePath);
			}

			return user;
		},
	);
