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

	const team = user?.team;
	const canChooseStarterPlan = await canChooseStarterPlanQuery(team?.id);
	return (
		<div className="grid grid-cols-1 gap-6">
			{team?.plan !== "trial" && (
				<ManageSubscription
					teamId={team?.id}
					plan={team?.plan}
					canceledAt={billing?.canceled_at}
				/>
			)}
			{team?.plan === "trial" && (
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
