import { ManageSubscription } from "@/components/settings/team/billings/manage-subscription";
import { Plans } from "@/components/settings/team/billings/plans";
import { UsageSkeleton } from "@/components/settings/team/billings/usage";
import { Suspense } from "react";
import { UsageClient } from "@/components/settings/team/billings/usage-client";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export async function generateMetadata() {
	return {
		title: "Billing | Proxed",
	};
}

export default async function Page() {
	batchPrefetch([
		trpc.user.me.queryOptions(),
		trpc.team.billing.queryOptions(),
		trpc.team.canChooseStarterPlan.queryOptions(),
	]);
	return (
		<HydrateClient>
			<div className="grid grid-cols-1 gap-6">
				<ManageSubscription />
				<Plans />
				<Suspense fallback={<UsageSkeleton />}>
					<UsageClient />
				</Suspense>
			</div>
		</HydrateClient>
	);
}
