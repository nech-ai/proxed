"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/types";

type BillingLimits = NonNullable<RouterOutputs["team"]["billing"]>["limits"];

const fallbackLimits: BillingLimits = {
	projectsLimit: null,
	projectsCount: 0,
	apiCallsLimit: null,
	apiCallsUsed: 0,
	apiCallsRemaining: 0,
	isCanceled: null,
	plan: null,
};

export function useBillingQuery() {
	const trpc = useTRPC();
	const billingQuery = useQuery(trpc.team.billing.queryOptions());
	const canChooseStarterPlanQuery = useQuery(
		trpc.team.canChooseStarterPlan.queryOptions(),
	);

	const billing = billingQuery.data ?? null;
	const limits = billing?.limits ?? fallbackLimits;
	const plan = billing?.plan ?? null;
	const canceledAt = billing?.canceledAt ?? null;
	const canChooseStarterPlan = Boolean(canChooseStarterPlanQuery.data);

	return {
		billing,
		limits,
		plan,
		canceledAt,
		canChooseStarterPlan,
		isBillingLoading: billingQuery.isLoading,
		isCanChooseStarterPlanLoading: canChooseStarterPlanQuery.isLoading,
		isLoading: billingQuery.isLoading || canChooseStarterPlanQuery.isLoading,
		isError: billingQuery.isError || canChooseStarterPlanQuery.isError,
	};
}
