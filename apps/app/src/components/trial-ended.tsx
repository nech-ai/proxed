"use client";

import { TrialEndedModal } from "./modals/trial-ended-modal";
import { useUserQuery } from "@/hooks/use-user";
import { useBillingQuery } from "@/hooks/use-billing";

export function TrialEnded() {
	const { data: user } = useUserQuery();
	const { canChooseStarterPlan, isCanChooseStarterPlanLoading } =
		useBillingQuery();

	if (!user?.teamId || !user.team || isCanChooseStarterPlanLoading) {
		return null;
	}

	if (!user.team.createdAt || !user.team.plan) {
		return null;
	}

	return (
		<TrialEndedModal
			createdAt={user.team.createdAt}
			plan={user.team.plan}
			teamId={user.team.id ?? user.teamId}
			canChooseStarterPlan={canChooseStarterPlan}
		/>
	);
}
