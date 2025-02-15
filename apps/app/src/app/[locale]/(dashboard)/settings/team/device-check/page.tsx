import { DeviceCheckCreateForm } from "@/components/settings/team/device-checks/device-check-create";
import { DeviceChecksBlock } from "@/components/settings/team/device-checks/device-checks";
import { getDeviceChecks } from "@proxed/supabase/cached-queries";

export async function generateMetadata() {
	return {
		title: "Device Checks | Proxed",
	};
}

export default async function Page() {
	const deviceChecks = await getDeviceChecks();

	if (!deviceChecks || !deviceChecks.data) {
		return <div>No device checks found</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-6">
			<DeviceCheckCreateForm revalidatePath="/settings/team/device-check" />
			<DeviceChecksBlock deviceChecks={deviceChecks.data} />
		</div>
	);
}
