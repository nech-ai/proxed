"use client";

import { ActionBlock } from "@/components/shared/action-block";
import { DeviceChecksList } from "./device-checks-list";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function DeviceChecksBlock() {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.deviceChecks.list.queryOptions());
	const deviceChecks = data?.data ?? [];

	return (
		<div className="space-y-6">
			<ActionBlock title="Device Check Configurations">
				<DeviceChecksList deviceChecks={deviceChecks} />
			</ActionBlock>
		</div>
	);
}
