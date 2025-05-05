import { ManageSubscription } from "@/components/settings/team/billings/manage-subscription";
import { Plans } from "@/components/settings/team/billings/plans";
import { UsageSkeleton } from "@/components/settings/team/billings/usage";
import { UsageServer } from "@/components/settings/team/billings/usage.server";
import { canChooseStarterPlanQuery } from "@/utils/plans-server";
import { getTeamBilling, getUser } from "@proxed/supabase/cached-queries";
import { Suspense } from "react";

export async function generateMetadata() {
	return {
		title: "Billing | Proxed",
	};
}

export default async function Page() {
	const { data: user } = await getUser();
	const { data: billing } = await getTeamBilling();

	const canChooseStarterPlan = await canChooseStarterPlanQuery(user?.team_id);
	return (
		<div className="grid grid-cols-1 gap-6">
			{billing?.plan !== "trial" && (
				<ManageSubscription
					teamId={user?.team_id}
					plan={billing?.plan}
					canceledAt={billing?.canceled_at}
				/>
			)}
			{billing?.plan === "trial" && (
				<div>
					<Plans
						teamId={user?.team_id}
						canChooseStarterPlan={canChooseStarterPlan}
					/>
				</div>
			)}
			<Suspense fallback={<UsageSkeleton />}>
				<UsageServer teamId={user?.team_id} plan={billing?.plan} />
			</Suspense>
		</div>
	);
}
