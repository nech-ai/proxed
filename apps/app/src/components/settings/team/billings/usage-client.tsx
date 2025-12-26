"use client";

import { Usage } from "./usage";
import { useBillingQuery } from "@/hooks/use-billing";

export function UsageClient() {
	const { limits, plan } = useBillingQuery();

	return <Usage data={limits} plan={plan ?? "free"} />;
}
