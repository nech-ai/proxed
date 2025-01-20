"use server";

import { deleteTeamInvitation } from "@proxed/supabase/mutations";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { deleteInviteSchema } from "./schema";

export const deleteInviteAction = authActionClient
	.schema(deleteInviteSchema)
	.action(
		async ({ parsedInput: { id, revalidatePath }, ctx: { supabase } }) => {
			await deleteTeamInvitation(supabase, id);

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return id;
		},
	);
