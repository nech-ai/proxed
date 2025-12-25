import { AppSidebar } from "@/components/layout/app-sidebar";
import { TrialEnded } from "@/components/trial-ended";
import { TeamProvider } from "@/store/team/provider";
import { UserProvider } from "@/store/user/provider";
import { SidebarProvider } from "@proxed/ui/components/sidebar";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import {
	batchPrefetch,
	getQueryClient,
	HydrateClient,
	trpc,
} from "@/trpc/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: PropsWithChildren) {
	const queryClient = getQueryClient();
	batchPrefetch([trpc.user.me.queryOptions()]);
	const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());

	if (!user) {
		return redirect("/login");
	}

	if (!user.teamId) {
		return redirect("/teams");
	}

	batchPrefetch([
		trpc.team.memberships.queryOptions(),
		trpc.team.billing.queryOptions(),
		trpc.team.canChooseStarterPlan.queryOptions(),
	]);
	const [teamMemberships, billing] = await Promise.all([
		queryClient.fetchQuery(trpc.team.memberships.queryOptions()),
		queryClient.fetchQuery(trpc.team.billing.queryOptions()),
	]);

	if (!teamMemberships?.length) {
		return redirect("/teams/create");
	}

	await Promise.all([
		queryClient.fetchQuery(trpc.team.current.queryOptions()),
		queryClient.fetchQuery(trpc.user.membership.queryOptions()),
	]);

	const userData = {
		id: user.id,
		fullName: user.fullName ?? "",
		teamId: user.teamId,
		locale: "en-GB",
		dateFormat: "yyyy-MM-dd HH:mm:ss",
		timezone: "Europe/London",
	};

	const teamData = {
		teamId: user.teamId,
		teamMembership:
			teamMemberships.find((m) => m.teamId === user.teamId) ?? null,
		allTeamMemberships: teamMemberships,
		user,
		billing,
	};

	return (
		<HydrateClient>
			<TeamProvider data={teamData}>
				<UserProvider data={userData}>
					<div className="flex h-screen">
						<SidebarProvider defaultOpen={false}>
							<AppSidebar />
							<div className="flex flex-col flex-grow overflow-auto">
								<div className="flex-grow">{children}</div>
								<Footer />
							</div>
						</SidebarProvider>
						<Suspense>
							<TrialEnded />
						</Suspense>
					</div>
				</UserProvider>
			</TeamProvider>
		</HydrateClient>
	);
}
