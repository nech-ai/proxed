"use server";

import { Cookies } from "@/utils/constants";
import { addYears } from "date-fns";
import { cookies } from "next/headers";
import { actionClient } from "./safe-action";
import { trackingConsentSchema } from "./schema";
import { LogEvents } from "@proxed/analytics";

export const trackingConsentAction = actionClient
	.schema(trackingConsentSchema)
	.metadata({
		name: "trackingConsentAction",
		track: LogEvents.TrackingConsent,
	})
	.action(async ({ parsedInput: value }) => {
		const cookieStore = await cookies();
		cookieStore.set({
			name: Cookies.TrackingConsent,
			value: value ? "1" : "0",
			expires: addYears(new Date(), 1),
		});

		return value;
	});
