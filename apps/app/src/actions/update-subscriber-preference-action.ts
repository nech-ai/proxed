"use server";

import { LogEvents } from "@proxed/analytics/events";
import { updateSubscriberPreference } from "@proxed/notifications";
import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { updateSubscriberPreferenceSchema } from "./schema";

export const updateSubscriberPreferenceAction = authActionClient
	.schema(updateSubscriberPreferenceSchema)
	.metadata({
		name: "update-subscriber-preference",
		track: {
			event: LogEvents.UpdateSubscriberPreference.event,
			channel: LogEvents.UpdateSubscriberPreference.channel,
		},
	})
	.action(async ({ parsedInput: { revalidatePath, ...data } }) => {
		// @ts-expect-error
		const preference = await updateSubscriberPreference(data);

		revalidatePathFunc(revalidatePath);

		return preference;
	});
