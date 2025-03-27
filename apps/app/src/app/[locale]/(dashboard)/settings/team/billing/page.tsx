import { ManageSubscription } from "@/components/settings/team/billings/manage-subscription";
import { Plans } from "@/components/settings/team/billings/plans";
import { UsageSkeleton } from "@/components/settings/team/billings/usage";
import { UsageServer } from "@/components/settings/team/billings/usage.server";
import { canChooseStarterPlanQuery } from "@/utils/plans-server";
import { getUser } from "@proxed/supabase/cached-queries";
import { Suspense } from "react";

export async function generateMetadata() {
	return {
		title: "Billing | Proxed",
	};
}

export default async function Page() {
	const user = await getUser();

	const team = user?.data?.team;
	const canChooseStarterPlan = await canChooseStarterPlanQuery(team?.id);
	return (
		<div className="grid grid-cols-1 gap-6">
			{team?.plan && <ManageSubscription teamId={team?.id} plan={team?.plan} />}
			{!team?.plan && (
				<div>
					<Plans
						teamId={team?.id}
						canChooseStarterPlan={canChooseStarterPlan}
					/>
				</div>
			)}
			<Suspense fallback={<UsageSkeleton />}>
				<UsageServer teamId={team?.id} plan={team?.plan} />
			</Suspense>
		</div>
	);
}
