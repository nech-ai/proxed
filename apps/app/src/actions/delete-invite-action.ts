"use server";

import { deleteTeamInvitation } from "@proxed/supabase/mutations";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { deleteInviteSchema } from "./schema";
import { LogEvents } from "@proxed/analytics";

export const deleteInviteAction = authActionClient
	.schema(deleteInviteSchema)
	.metadata({
		name: "deleteInviteAction",
		track: LogEvents.DeleteInvite,
	})
	.action(
		async ({ parsedInput: { id, revalidatePath }, ctx: { supabase } }) => {
			await deleteTeamInvitation(supabase, id);

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			return id;
		},
	);
