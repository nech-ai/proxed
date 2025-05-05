import { getPlans } from "@/utils/plans";
import { api } from "@/utils/polar";
import { getSession, getUser } from "@proxed/supabase/cached-queries";
import { geolocation } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
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

	const successUrl = new URL("/api/checkout/success", req.nextUrl.origin);
	successUrl.searchParams.set("redirectPath", redirectPath);

	const checkout = await api.checkouts.create({
		products: [selectedPlan.id],
		successUrl: successUrl.toString(),
		customerExternalId: teamId ?? user.team_id,
		customerEmail: user.email ?? undefined,
		customerName: user.full_name ?? undefined,
		customerBillingAddress: {
			country: country ?? "US",
		},
		metadata: {
			organizationId: teamId ?? user.team_id, // TODO: remove this
			teamId: teamId ?? user.team_id,
			companyName: user.team?.name ?? "",
		},
	});

	return NextResponse.redirect(checkout.url);
};
