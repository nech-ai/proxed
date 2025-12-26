"use client";

import { ActionBlock } from "@/components/shared/action-block";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@proxed/ui/components/tabs";
import { useState } from "react";
import { TeamInvitationsList } from "./team-invitations-list";
import { TeamMembersList } from "./team-members-list";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function TeamMembersBlock() {
	const [activeTab, setActiveTab] = useState("members");
	const trpc = useTRPC();
	const { data: memberships = [] } = useQuery(trpc.team.members.queryOptions());
	const { data: invitations = [] } = useQuery(trpc.team.invites.queryOptions());

	return (
		<ActionBlock title="Team Members">
			<Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab)}>
				<TabsList className="mb-4">
					<TabsTrigger value="members">Members</TabsTrigger>
					<TabsTrigger value="invitations">Pending</TabsTrigger>
				</TabsList>
				<TabsContent value="members">
					<TeamMembersList memberships={memberships} />
				</TabsContent>
				<TabsContent value="invitations">
					<TeamInvitationsList invitations={invitations} />
				</TabsContent>
			</Tabs>
		</ActionBlock>
	);
}
