"use client";

import {
	BarChartIcon,
	BriefcaseIcon,
	FileIcon,
	SettingsIcon,
} from "lucide-react";
import type { TeamMembership, User } from "@proxed/supabase/types";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarTrigger,
	useSidebar,
} from "@proxed/ui/components/sidebar";
import { NavMain } from "./nav-main";
import { TeamSwitcher } from "./team-switcher";
import { Logo } from "./logo";
import { useTeam } from "@/hooks/use-team";

const data = {
	navMain: [
		{
			title: "Metrics",
			url: "/metrics",
			icon: BarChartIcon,
		},
		{
			title: "Executions",
			url: "/executions",
			icon: FileIcon,
		},
		{
			title: "Projects",
			url: "/projects",
			icon: BriefcaseIcon,
		},
		{
			title: "Settings",
			url: "/settings/team/",
			icon: SettingsIcon,
		},
	],
};

interface AppSidebarProps {
	teamMemberships: TeamMembership[];
	user: User;
}

export function AppSidebar({ teamMemberships, user }: AppSidebarProps) {
	const { teamId } = useTeam();
	const { open } = useSidebar();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex w-full items-center justify-between">
					<Logo withLabel={false} />
					{open && <SidebarTrigger />}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				{!open && <SidebarTrigger />}
				<TeamSwitcher teamMemberships={teamMemberships} activeTeamId={teamId} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
