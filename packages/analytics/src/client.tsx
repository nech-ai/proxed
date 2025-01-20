import {
	OpenPanelComponent,
	type PostEventPayload,
	useOpenPanel,
} from "@openpanel/nextjs";

const isProd = process.env.NODE_ENV === "production";

interface ProviderProps {
	profileId?: string | null | undefined;
}

type TrackOptions = PostEventPayload["properties"] & {
	event: string;
};

const AnalyticsProvider = ({ profileId }: ProviderProps) => {
	const args = {
		clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID as string,
		trackAttributes: true,
		trackScreenViews: isProd,
		trackOutgoingLinks: isProd,
		...(profileId && { profileId }),
	} as const;

	return <OpenPanelComponent {...args} />;
};

function track({ event, ...properties }: TrackOptions): void {
	const { track: openTrack } = useOpenPanel();

	if (!isProd) {
		console.log("Track", { event, ...properties });
		return;
	}

	openTrack(event, properties);
}

export { AnalyticsProvider, track };
