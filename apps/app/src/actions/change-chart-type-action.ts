"use server";

import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { authActionClient } from "./safe-action";
import { changeChartTypeSchema } from "./schema";
import { LogEvents } from "@proxed/analytics";

export const changeChartTypeAction = authActionClient
	.schema(changeChartTypeSchema)
	.metadata({
		name: "changeChartTypeAction",
		track: LogEvents.ChangeChartType,
	})
	.action(async ({ parsedInput: value, ctx: { user } }) => {
		const cookieStore = await cookies();
		cookieStore.set({
			name: Cookies.ChartType,
			value,
			expires: addYears(new Date(), 1),
		});

		revalidateTag(`chart_${user.team_id}`);

		return value;
	});
