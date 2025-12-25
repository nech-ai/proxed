import { TeamBillingForm } from "@/components/teams/team-billing-form";
import type { Metadata } from "next";
import {
	batchPrefetch,
	getQueryClient,
	HydrateClient,
	trpc,
} from "@/trpc/server";
export const metadata: Metadata = {
	title: "Choose a Plan | Proxed",
};

export default async function Page() {
	const queryClient = getQueryClient();
	batchPrefetch([trpc.user.me.queryOptions()]);
	await queryClient.fetchQuery(trpc.user.me.queryOptions());
	return (
		<HydrateClient>
			<TeamBillingForm />
		</HydrateClient>
	);
}
