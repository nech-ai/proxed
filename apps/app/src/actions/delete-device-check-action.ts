"use server";

import { deleteDeviceCheck } from "@proxed/supabase/mutations";
import { authActionClient } from "./safe-action";
import { z } from "zod";
import { revalidatePath as revalidatePathFunc } from "next/cache";

const schema = z.object({
	id: z.string(),
	revalidatePath: z.string().optional(),
});

export const deleteDeviceCheckAction = authActionClient
	.schema(schema)
	.action(
		async ({ parsedInput: { id, revalidatePath }, ctx: { supabase } }) => {
			const { error } = await deleteDeviceCheck(supabase, id);

			if (error) {
				throw new Error("Failed to delete device check");
			}

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return { success: true };
		},
	);
