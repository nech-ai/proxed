export type BillingPlan =
	| "starter-monthly"
	| "starter-yearly"
	| "pro-monthly"
	| "pro-yearly"
	| "ultimate-monthly"
	| "ultimate-yearly"
	| "trial";

export type TeamBilling = {
	plan: BillingPlan;
	email: string | null;
	canceled_at: string | null;
	limits: {
		projects_limit: number | null;
		projects_count: number;
		api_calls_limit: number | null;
		api_calls_used: number;
		api_calls_remaining: number;
	};
};
