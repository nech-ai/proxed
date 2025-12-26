import { getPlans } from "@/utils/plans";
import { api } from "@/utils/polar";
import { getSession, getUser } from "@proxed/supabase/cached-queries";
import { geolocation } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
	type CheckoutCreateParams = Parameters<typeof api.checkouts.create>[0];
	type BillingCountry = NonNullable<
		CheckoutCreateParams["customerBillingAddress"]
	>["country"];
	const {
		data: { session },
	} = await getSession();

	if (!session?.user?.id) {
		throw new Error("You must be logged in");
	}

	const plan = req.nextUrl.searchParams.get("plan");
	const redirectPath = req.nextUrl.searchParams.get("redirectPath") ?? "/";
	const teamId = req.nextUrl.searchParams.get("teamId");

	const plans = getPlans();

	const selectedPlan = plans[plan as keyof typeof plans];

	if (!selectedPlan) {
		throw new Error("Invalid plan");
	}

	const { data: user } = await getUser();

	if (!user?.team_id) {
		throw new Error("Team not found");
	}

	const { country } = geolocation(req);
	const billingCountry = (country ?? "US").toUpperCase() as BillingCountry;

	const successUrl = new URL("/api/checkout/success", req.nextUrl.origin);
	successUrl.searchParams.set("redirectPath", redirectPath);

	const checkout = await api.checkouts.create({
		products: [selectedPlan.id],
		successUrl: successUrl.toString(),
		externalCustomerId: teamId ?? user.team_id,
		customerEmail: user.email ?? undefined,
		customerName: user.full_name ?? undefined,
		customerBillingAddress: {
			country: billingCountry,
		},
		metadata: {
			teamId: teamId ?? user.team_id,
			companyName: user.team?.name ?? "",
		},
	});

	return NextResponse.redirect(checkout.url);
};
