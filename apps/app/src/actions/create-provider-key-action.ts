"use server";

import { createProviderKey } from "@proxed/supabase/mutations";
import { authActionClient } from "./safe-action";
import { createProviderKeySchema } from "./schema";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { LogEvents } from "@proxed/analytics";

export const createProviderKeyAction = authActionClient
	.schema(createProviderKeySchema)
	.metadata({
		name: "createProviderKeyAction",
		track: LogEvents.CreateProviderKey,
	})
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
				display_name: data.display_name || "",
				partial_key_server: data.partial_key_server || "",
				provider: data.provider || "OPENAI",
			});

			if (error) {
				throw new Error(error.message);
			}

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return providerKey;
		},
	);
