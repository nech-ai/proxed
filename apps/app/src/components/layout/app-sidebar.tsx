"use client";

import {
	BarChartIcon,
	BriefcaseIcon,
	FileIcon,
	SettingsIcon,
} from "lucide-react";
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
import { cn } from "@proxed/ui/utils";
import { Trial } from "../trial";
import { FeedbackDialog } from "./feedback-dialog";

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

export function AppSidebar() {
	const { open } = useSidebar();
	const { isMobile } = useSidebar();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex w-full items-center justify-between">
					<div
						className={cn(
							"flex items-center",
							open ? "pl-3" : "w-10 justify-center",
						)}
					>
						<Logo withLabel={open} />
					</div>
					{open && <SidebarTrigger />}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				{isMobile && (
					<div className="pb-2 px-2 space-y-2">
						<Trial />
						<FeedbackDialog />
					</div>
				)}
				{!open && <SidebarTrigger />}
				<TeamSwitcher />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
