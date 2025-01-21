"use server";

import { createProviderKey } from "@proxed/supabase/mutations";
import { authActionClient } from "./safe-action";
import { createProviderKeySchema } from "./schema";
import { revalidatePath as revalidatePathFunc } from "next/cache";

export const createProviderKeyAction = authActionClient
	.schema(createProviderKeySchema)
	.action(
		async ({
			parsedInput: { revalidatePath, ...data },
			ctx: { user, supabase },
		}) => {
			if (!user.team_id) {
				throw new Error("User is not in a team");
			}

			const { data: providerKey, error } = await createProviderKey(supabase, {
				...data,
				team_id: user.team_id,
			});

			if (error) {
				throw new Error("Failed to create partial key");
			}

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return providerKey;
		},
	);
