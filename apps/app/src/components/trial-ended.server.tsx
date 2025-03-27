import { canChooseStarterPlanQuery } from "@/utils/plans-server";
import { TrialEndedModal } from "./modals/trial-ended-modal";

interface TrialEndedProps {
	createdAt: string;
	plan: string;
	teamId: string;
}

export async function TrialEnded({ createdAt, plan, teamId }: TrialEndedProps) {
	const canChooseStarterPlan = await canChooseStarterPlanQuery(teamId);

	return (
		<TrialEndedModal
			createdAt={createdAt}
			plan={plan}
			teamId={teamId}
			canChooseStarterPlan={canChooseStarterPlan}
		/>
	);
}
