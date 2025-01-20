"use client";

import { ActionBlock } from "@/components/shared/action-block";
import type { TeamInvitation, TeamMembership } from "@proxed/supabase/types";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@proxed/ui/components/tabs";
import { useState } from "react";
import { TeamInvitationsList } from "./team-invitations-list";
import { TeamMembersList } from "./team-members-list";

export function TeamMembersBlock({
	memberships,
	invitations,
}: {
	memberships: TeamMembership[];
	invitations: TeamInvitation[];
}) {
	const [activeTab, setActiveTab] = useState("members");

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
