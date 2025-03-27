"use server";

import { deleteProviderKey } from "@proxed/supabase/mutations";
import { authActionClient } from "./safe-action";
import { z } from "zod";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { LogEvents } from "@proxed/analytics";

const schema = z.object({
	id: z.string(),
	revalidatePath: z.string().optional(),
});

export const deleteProviderKeyAction = authActionClient
	.schema(schema)
	.metadata({
		name: "deleteProviderKeyAction",
		track: LogEvents.DeleteProviderKey,
	})
	.action(
		async ({ parsedInput: { id, revalidatePath }, ctx: { supabase } }) => {
			const { error } = await deleteProviderKey(supabase, id);

			if (error) {
				throw new Error("Failed to delete partial key");
			}

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return { success: true };
		},
	);
