import { UTCDate } from "@date-fns/utc";
import { addDays, differenceInDays, isSameDay, parseISO } from "date-fns";
import { ChoosePlanButton } from "./choose-plan-button";

export function Trial({
	teamId,
	createdAt,
}: { teamId: string; createdAt: string }) {
	// Parse dates using UTCDate for consistent timezone handling
	const rawCreatedAt = parseISO(createdAt);
	const today = new UTCDate();

	// Convert to UTCDate for consistent calculation
	const createdAtUtc = new UTCDate(rawCreatedAt);

	// Set trial end date 14 days from creation
	const trialEndDate = addDays(createdAtUtc, 14);

	// If team was created today, show exactly 14 days
	// Otherwise calculate the remaining days
	const daysLeft = isSameDay(createdAtUtc, today)
		? 14
		: Math.max(0, differenceInDays(trialEndDate, today));

	const isTrialEnded = daysLeft <= 0;

	// This would typically come from a server query
	const canChooseStarterPlan = true;

	if (isTrialEnded) {
		return (
			<ChoosePlanButton
				initialIsOpen={false}
				daysLeft={daysLeft}
				teamId={teamId}
				canChooseStarterPlan={canChooseStarterPlan}
			>
				Unlock full access
			</ChoosePlanButton>
		);
	}

	return (
		<ChoosePlanButton
			daysLeft={daysLeft}
			teamId={teamId}
			canChooseStarterPlan={canChooseStarterPlan}
		>
			Free trial • {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
		</ChoosePlanButton>
	);
}
