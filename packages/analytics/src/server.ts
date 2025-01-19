import { OpenPanel, type PostEventPayload } from "@openpanel/nextjs";
import { waitUntil } from "@vercel/functions";
import { cookies } from "next/headers";

interface AnalyticsProps {
	userId?: string;
	fullName?: string | null;
}

type TrackOptions = PostEventPayload["properties"] & {
	event: string;
};

type AnalyticsClient = OpenPanel;

const isProd = process.env.NODE_ENV === "production";

async function getTrackingConsent(): Promise<boolean> {
	const cookieStore = await cookies();
	return (
		!cookieStore.has("tracking-consent") ||
		cookieStore.get("tracking-consent")?.value === "1"
	);
}

function parseFullName(fullName: string): [string, string] {
	const [firstName = "", lastName = ""] = fullName.split(" ");
	return [firstName, lastName];
}

function createAnalyticsClient(): AnalyticsClient {
	return new OpenPanel({
		clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID as string,
		clientSecret: process.env.OPENPANEL_SECRET_KEY as string,
	});
}

export async function setupAnalytics(options?: AnalyticsProps) {
	const { userId, fullName } = options ?? {};
	const trackingConsent = await getTrackingConsent();
	const client = createAnalyticsClient();

	if (trackingConsent && userId && fullName) {
		const [firstName, lastName] = parseFullName(fullName);
		await waitUntil(
			client.identify({
				profileId: userId,
				firstName,
				lastName,
			}),
		);
	}

	return {
		track: async ({ event, ...properties }: TrackOptions): Promise<void> => {
			if (!isProd) {
				console.debug("Analytics Track", { event, ...properties });
				return;
			}

			await waitUntil(client.track(event, properties));
		},
	};
}
