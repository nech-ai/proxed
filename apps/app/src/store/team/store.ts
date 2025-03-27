import { createContext } from "react";
import { createStore } from "zustand";
import type { TeamBilling, TeamMembership, User } from "@proxed/supabase/types";
import { config } from "@config";

export type TeamFeature =
	| "create_project"
	| "api_calls"
	| "advanced_analytics"
	| "advanced_rate_limiting"
	| "dedicated_support";

export interface TeamData {
	teamId: string | null;
	teamMembership: TeamMembership | null;
	allTeamMemberships: TeamMembership[];
	user: User;
	billing: TeamBilling | null;
}

export interface TeamProps {
	data: TeamData;
}

export interface TeamState extends TeamProps {
	setTeam: (team: TeamData) => void;
	canAccessFeature: (feature: TeamFeature) => boolean;
}

const teamBroadcastChannel = new BroadcastChannel("team");

export const createTeamStore = (initProps: TeamProps) => {
	return createStore<TeamState>()((set, get) => ({
		data: initProps.data,
		setTeam: (team: TeamData) => set({ data: team }),
		canAccessFeature: (feature: TeamFeature) => {
			const planWithBilling = get().data.billing?.plan;
			if (!planWithBilling) return false;

			const plan = planWithBilling.split("-")[0];
			const limits = get().data.billing?.limits;

			switch (feature) {
				case "create_project":
					if (!limits) return false;
					return !(
						plan === "starter" &&
						limits.projects_count >= (limits.projects_limit || 1)
					);
				case "api_calls":
					if (!limits) return false;
					return !(
						limits.api_calls_limit &&
						limits.api_calls_used >= limits.api_calls_limit
					);
				case "advanced_analytics":
					return plan === "ultimate";
				case "advanced_rate_limiting":
					return plan === "pro" || plan === "ultimate";
				case "dedicated_support":
					return plan === "ultimate";
				default:
					return false;
			}
		},
	}));
};

export type TeamStore = ReturnType<typeof createTeamStore>;
export const TeamContext = createContext<TeamStore | null>(null);

// Handle team events
teamBroadcastChannel.addEventListener(
	"message",
	(
		event: MessageEvent<{ type: "loaded" | "logout"; teamId: string | null }>,
	) => {
		if (event.data.type === "logout") {
			window.location.href = config.auth.redirectAfterLogout;
		}
	},
);
