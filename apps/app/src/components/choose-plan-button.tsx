"use client";

import { Button } from "@proxed/ui/components/button";
import { useState } from "react";
import { ChoosePlanModal } from "./modals/choose-plan-modal";

export function ChoosePlanButton({
	children,
	initialIsOpen,
	daysLeft,
	teamId,
	canChooseStarterPlan,
}: {
	children: React.ReactNode;
	initialIsOpen?: boolean;
	daysLeft?: number;
	teamId: string;
	canChooseStarterPlan: boolean;
}) {
	const [isOpen, setIsOpen] = useState(initialIsOpen ?? false);

	return (
		<>
			<Button
				onClick={() => setIsOpen(true)}
				variant="outline"
				size="sm"
				className="font-normal"
			>
				{children}
			</Button>

			<ChoosePlanModal
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				daysLeft={daysLeft}
				teamId={teamId}
				canChooseStarterPlan={canChooseStarterPlan}
			/>
		</>
	);
}
