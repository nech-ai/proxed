import { DeviceCheckCreateForm } from "@/components/settings/team/device-checks/device-check-create";
import { DeviceChecksBlock } from "@/components/settings/team/device-checks/device-checks";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export async function generateMetadata() {
	return {
		title: "Device Checks | Proxed",
	};
}

export default async function Page() {
	batchPrefetch([trpc.deviceChecks.list.queryOptions()]);

	return (
		<HydrateClient>
			<div className="grid grid-cols-1 gap-6">
				<DeviceCheckCreateForm />
				<DeviceChecksBlock />
			</div>
		</HydrateClient>
	);
}
