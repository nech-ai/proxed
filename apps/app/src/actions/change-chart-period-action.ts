"use server";

import { revalidateTag } from "next/cache";
import { authActionClient } from "./safe-action";
import { changeChartPeriodSchema } from "./schema";
import { LogEvents } from "@proxed/analytics";

export const changeChartPeriodAction = authActionClient
	.schema(changeChartPeriodSchema)
	.metadata({
		name: "changeChartPeriodAction",
		track: LogEvents.ChangeChartPeriod,
	})
	.action(async ({ parsedInput: value, ctx: { user } }) => {
revalidateTag(`chart_${user.team_id}`);

		return value;
	});
