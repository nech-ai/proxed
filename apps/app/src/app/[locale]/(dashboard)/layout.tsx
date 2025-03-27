import { AppSidebar } from "@/components/layout/app-sidebar";
import { TrialEnded } from "@/components/trial-ended.server";
import { TeamProvider } from "@/store/team/provider";
import { UserProvider } from "@/store/user/provider";
import {
	getTeamMemberships,
	getUser,
	getTeamBilling,
} from "@proxed/supabase/cached-queries";
import { SidebarProvider } from "@proxed/ui/components/sidebar";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: PropsWithChildren) {
	const { data: user } = await getUser();

	if (!user) {
		return redirect("/login");
	}

	if (!user.team_id) {
		return redirect("/teams");
	}

	const userTeamMemberships = await getTeamMemberships();
	const teamMemberships = userTeamMemberships?.data ?? [];

	if (!teamMemberships?.length) {
		return redirect("/teams/create");
	}

	const { data: billing } = await getTeamBilling();

	const userData = {
		id: user.id,
		full_name: user.full_name ?? "",
		team_id: user.team_id,
		locale: "en-GB",
		date_format: "yyyy-MM-dd HH:mm:ss",
		timezone: "Europe/London",
	};

	const teamData = {
		teamId: user.team_id,
		teamMembership:
			teamMemberships.find((m) => m.team_id === user.team_id) ?? null,
		allTeamMemberships: teamMemberships,
		user,
		billing,
	};

	return (
		<TeamProvider data={teamData}>
			<UserProvider data={userData}>
				<div className="flex h-screen">
					<SidebarProvider defaultOpen={false}>
						<AppSidebar teamMemberships={teamMemberships} user={user} />
						<div className="flex flex-col overflow-auto w-full">{children}</div>
					</SidebarProvider>
					<Suspense>
						<TrialEnded
							createdAt={user.team?.created_at}
							plan={user.team?.plan}
							teamId={user.team?.id}
						/>
					</Suspense>
				</div>
			</UserProvider>
		</TeamProvider>
	);
}
