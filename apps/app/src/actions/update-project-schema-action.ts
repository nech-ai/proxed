"use server";

import { authActionClient } from "./safe-action";
import { updateProjectSchemaSchema } from "./schema";
import { updateProjectSchema } from "@proxed/supabase/mutations";
import { revalidateTag } from "next/cache";

export const updateProjectSchemaAction = authActionClient
  .schema(updateProjectSchemaSchema)
  .action(
    async ({
      parsedInput: { projectId, schemaConfig },
      ctx: { supabase, user },
    }) => {
      if (!user?.team_id) return;

      const result = await updateProjectSchema(
        supabase,
        projectId,
        schemaConfig,
      );

      revalidateTag(`project_${projectId}`);

      return result.data;
    },
  );
