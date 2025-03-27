const POLAR_ENVIRONMENT = process.env.POLAR_ENVIRONMENT;

export const PLANS = {
	production: {
		trial: {
			id: "trial",
			name: "Trial",
			key: "trial",
			price: 0,
			billingCycle: "monthly",
			apiCalls: 2000,
		},
		"starter-monthly": {
			id: "0e756236-86a2-4770-9f02-fe0bf3aef672",
			name: "Starter",
			key: "starter-monthly",
			price: 2.5,
			billingCycle: "monthly",
			apiCalls: 1000,
		},
		"starter-yearly": {
			id: "c409b494-2015-4b4e-8a26-ea4e6d7c5899",
			name: "Starter",
			key: "starter-yearly",
			price: 25,
			billingCycle: "yearly",
			apiCalls: 1000,
		},
		"pro-monthly": {
			id: "0b57c94a-1c4b-4104-bfab-43d3543bf76d",
			name: "Pro",
			key: "pro-monthly",
			price: 10,
			billingCycle: "monthly",
			apiCalls: 10000,
		},
		"pro-yearly": {
			id: "9cb849f4-dfa9-476e-8de8-498da46f7783",
			name: "Pro",
			key: "pro-yearly",
			price: 100,
			billingCycle: "yearly",
			apiCalls: 10000,
		},
		"ultimate-monthly": {
			id: "d9fba00c-b1bb-48a6-a84e-390446b3f7b8",
			name: "Ultimate",
			key: "ultimate-monthly",
			price: 30,
			billingCycle: "monthly",
			apiCalls: 50000,
		},
		"ultimate-yearly": {
			id: "68ff75a3-9bd1-4fc9-8b22-cd081395c3ac",
			name: "Ultimate",
			key: "ultimate-yearly",
			price: 300,
			billingCycle: "yearly",
			apiCalls: 50000,
		},
	},
	sandbox: {
		trial: {
			id: "trial",
			name: "Trial",
			key: "trial",
			price: 0,
			billingCycle: "monthly",
			apiCalls: 2000,
		},
		"starter-monthly": {
			id: "ecc28d62-dacb-4d86-b78a-4c89c3048931",
			name: "Starter",
			key: "starter-monthly",
			price: 2.5,
			billingCycle: "monthly",
			apiCalls: 1000,
		},
		"starter-yearly": {
			id: "f394b6e6-c199-4384-9b70-b32ba1c2327c",
			name: "Starter",
			key: "starter-yearly",
			price: 25,
			billingCycle: "yearly",
			apiCalls: 1000,
		},
		"pro-monthly": {
			id: "b0a50602-7d60-4924-a67b-91aec9d8eb55",
			name: "Pro",
			key: "pro-monthly",
			price: 10,
			billingCycle: "monthly",
			apiCalls: 10000,
		},
		"pro-yearly": {
			id: "6b387f89-33d2-453f-95f5-440d11cef196",
			name: "Pro",
			key: "pro-yearly",
			price: 100,
			billingCycle: "yearly",
			apiCalls: 10000,
		},
		"ultimate-monthly": {
			id: "4dc5a293-d2b0-4375-bc61-458710d53194",
			name: "Ultimate",
			key: "ultimate-monthly",
			price: 30,
			billingCycle: "monthly",
			apiCalls: 50000,
		},
		"ultimate-yearly": {
			id: "d80aeb68-08a0-4c09-9358-de53454ebc3e",
			name: "Ultimate",
			key: "ultimate-yearly",
			price: 300,
			billingCycle: "yearly",
			apiCalls: 50000,
		},
	},
};

export const getPlans = () => {
	return PLANS[POLAR_ENVIRONMENT as keyof typeof PLANS] || PLANS.sandbox;
};

export const getMonthlyEquivalent = (yearlyPrice: number) => {
	return yearlyPrice / 12;
};

export const formatPrice = (price: number, currency = "USD") => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: price % 1 === 0 ? 0 : 2,
	}).format(price);
};

export const calculateCostPerCall = (
	plan: keyof (typeof PLANS)[keyof typeof PLANS],
) => {
	const environment = (POLAR_ENVIRONMENT as keyof typeof PLANS) || "sandbox";
	const planData = PLANS[environment][plan];

	// For yearly plans, divide by (monthly API calls × 12 months)
	const apiCallsTotal =
		planData.billingCycle === "yearly"
			? planData.apiCalls * 12
			: planData.apiCalls;

	const costPerCall = planData.price / apiCallsTotal;
	return costPerCall;
};

export const formatCostPerCall = (
	plan: keyof (typeof PLANS)[keyof typeof PLANS],
) => {
	const costPerCall = calculateCostPerCall(plan);
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 4,
		maximumFractionDigits: 4,
	}).format(costPerCall);
};

export function getPlanByProductId(productId: string) {
	const plan = Object.values(getPlans()).find((plan) => plan.id === productId);

	if (!plan) {
		throw new Error("Plan not found");
	}

	return plan.key;
}

export function getPlanLimits(plan: string) {
	switch (plan) {
		case "starter-monthly":
		case "starter-yearly":
			return {
				projects: 1,
				calls: 1000,
			};
		case "pro-monthly":
		case "pro-yearly":
			return {
				projects: null,
				calls: 10000,
			};
		case "ultimate-monthly":
		case "ultimate-yearly":
			return {
				projects: null,
				calls: 50000,
			};
		case "trial":
			return {
				projects: 5,
				calls: 2000,
			};
		default:
			return {
				projects: null,
				calls: null,
			};
	}
}
