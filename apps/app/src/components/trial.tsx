import { UTCDate } from "@date-fns/utc";
import { addDays, differenceInDays, isSameDay, parseISO } from "date-fns";
import { ChoosePlanButton } from "./choose-plan-button";
import { Button } from "@proxed/ui/components/button";

export function Trial({
	teamId,
	createdAt,
	canceledAt,
	plan,
}: {
	teamId: string;
	createdAt: string;
	canceledAt: string | null;
	plan: string | null;
}) {
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

	const isOnTrialOrNoPlan = plan === "trial" || plan === null;

	// This would typically come from a server query
	const canChooseStarterPlan = true;

	// Case 1: Trial Ended & No Active Plan
	if (isTrialEnded && isOnTrialOrNoPlan) {
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

	// Case 2: Active Trial
	if (isOnTrialOrNoPlan) {
		// plan is 'trial' or null, and not ended (daysLeft > 0)
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

	// Case 3: Canceled Paid Plan (but not yet expired)
	if (canceledAt) {
		// plan is NOT 'trial' or null here
		const canceledAtUtc = new UTCDate(parseISO(canceledAt));
		const daysUntilCancellation = Math.max(
			0,
			differenceInDays(canceledAtUtc, today),
		);

		if (daysUntilCancellation > 0) {
			return (
				<Button variant="outline" size="sm" className="font-normal" disabled>
					Plan expires in {daysUntilCancellation}{" "}
					{daysUntilCancellation === 1 ? "day" : "days"}
				</Button>
			);
		}
	}

	// Case 4: Active Paid Plan (not canceled or cancellation date passed) or other states
	return null;
}
