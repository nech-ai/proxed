const POLAR_ENVIRONMENT = process.env.POLAR_ENVIRONMENT;

export const PLANS = {
	production: {
		"starter-monthly": {
			id: "ac17601d-29a9-4530-ab9d-9f6ea39f7e32",
			name: "Starter",
			key: "starter-monthly",
			price: 2.5,
			billingCycle: "monthly",
			apiCalls: 1000,
		},
		"starter-yearly": {
			id: "ac17601d-29a9-4530-ab9d-9f6ea39f7e32",
			name: "Starter",
			key: "starter-yearly",
			price: 25,
			billingCycle: "yearly",
			apiCalls: 1000,
		},
		"pro-monthly": {
			id: "0a0a36b1-38d3-4082-85ca-f46cec9d8b1a",
			name: "Pro",
			key: "pro-monthly",
			price: 10,
			billingCycle: "monthly",
			apiCalls: 10000,
		},
		"pro-yearly": {
			id: "0a0a36b1-38d3-4082-85ca-f46cec9d8b1a",
			name: "Pro",
			key: "pro-yearly",
			price: 100,
			billingCycle: "yearly",
			apiCalls: 10000,
		},
		"ultimate-monthly": {
			id: "0a0a36b1-38d3-4082-85ca-f46cec9d8b1a",
			name: "Ultimate",
			key: "ultimate-monthly",
			price: 30,
			billingCycle: "monthly",
			apiCalls: 50000,
		},
		"ultimate-yearly": {
			id: "0a0a36b1-38d3-4082-85ca-f46cec9d8b1a",
			name: "Ultimate",
			key: "ultimate-yearly",
			price: 300,
			billingCycle: "yearly",
			apiCalls: 50000,
		},
	},
	sandbox: {
		"starter-monthly": {
			id: "265b6845-4fca-4813-86b7-70fb606626dd",
			name: "Starter",
			key: "starter-monthly",
			price: 2.5,
			billingCycle: "monthly",
			apiCalls: 1000,
		},
		"starter-yearly": {
			id: "265b6845-4fca-4813-86b7-70fb606626dd",
			name: "Starter",
			key: "starter-yearly",
			price: 25,
			billingCycle: "yearly",
			apiCalls: 1000,
		},
		"pro-monthly": {
			id: "dc9e75d2-c1ef-4265-9265-f599e54eb172",
			name: "Pro",
			key: "pro-monthly",
			price: 10,
			billingCycle: "monthly",
			apiCalls: 10000,
		},
		"pro-yearly": {
			id: "dc9e75d2-c1ef-4265-9265-f599e54eb172",
			name: "Pro",
			key: "pro-yearly",
			price: 100,
			billingCycle: "yearly",
			apiCalls: 10000,
		},
		"ultimate-monthly": {
			id: "0a0a36b1-38d3-4082-85ca-f46cec9d8b1a",
			name: "Ultimate",
			key: "ultimate-monthly",
			price: 30,
			billingCycle: "monthly",
			apiCalls: 50000,
		},
		"ultimate-yearly": {
			id: "0a0a36b1-38d3-4082-85ca-f46cec9d8b1a",
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
		default:
			return {
				projects: null,
				calls: null,
			};
	}
}
