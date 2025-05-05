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

	const userData = await getUser();

	if (!userData?.data?.team) {
		throw new Error("Team not found");
	}

	const { country } = geolocation(req);

	const successUrl = new URL("/api/checkout/success", req.nextUrl.origin);
	successUrl.searchParams.set("redirectPath", redirectPath);

	const checkout = await api.checkouts.create({
		products: [selectedPlan.id],
		successUrl: successUrl.toString(),
		customerExternalId: teamId ?? userData.data.team?.id,
		customerEmail: userData.data.email ?? undefined,
		customerName: userData.data.full_name ?? undefined,
		customerBillingAddress: {
			country: country ?? "US",
		},
		metadata: {
			teamId: teamId ?? userData.data.team?.id ?? "",
			companyName: userData.data.team?.name ?? "",
		},
	});

	return NextResponse.redirect(checkout.url);
};
