"use server";

import { deleteTeam } from "@proxed/supabase/mutations";
import { revalidateTag } from "next/cache";
import { authActionClient } from "./safe-action";
import { deleteTeamSchema } from "./schema";

export const deleteTeamAction = authActionClient
  .schema(deleteTeamSchema)
  .action(async ({ parsedInput: { teamId }, ctx: { user, supabase } }) => {
    const { data } = await deleteTeam(supabase, teamId);

    revalidateTag(`user_${user.id}`);
    revalidateTag(`teams_${user.id}`);

    return data;
  });
