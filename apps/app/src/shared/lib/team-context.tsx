"use client";

import { signOutAction } from "@/actions/sign-out-action";
import { config } from "@config";
import type { TeamMembership, User } from "@proxed/supabase/types";
import { useAction } from "next-safe-action/hooks";
import type { PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";

type TeamContext = {
  teamId: string | null;
  reloadTeamId: (teamId: string) => Promise<void>;
  teamMembership: TeamMembership | null;
  allTeamMemberships: TeamMembership[];
  user: User;
};

const teamBroadcastChannel = new BroadcastChannel("team");
type TeamEvent = {
  type: "loaded" | "logout";
  teamId: string | null;
};

export const teamContext = createContext<TeamContext>({
  teamId: null,
  reloadTeamId: () => Promise.resolve(),
  teamMembership: null,
  allTeamMemberships: [],
  user: {} as User,
});

export function TeamContextProvider({
  children,
  initialTeamId,
  allTeamMemberships,
  user,
}: PropsWithChildren<{
  initialTeamId: string | null;
  allTeamMemberships: TeamMembership[];
  user: User;
}>) {
  const [teamId, setTeamId] = useState<string | null>(initialTeamId);
  const signOut = useAction(signOutAction);
  const [teamMembership, setTeamMembership] = useState<TeamMembership | null>(
    null,
  );

  const reloadTeamId = async (teamId: string) => {
    setTeamId(teamId);
  };

  useEffect(() => {
    if (teamId) {
      teamBroadcastChannel.postMessage({
        type: "loaded",
        teamId,
      });
    }
  }, [teamId]);

  useEffect(() => {
    const teamMembership = allTeamMemberships.find(
      (membership) => membership.team_id === teamId,
    );
    setTeamMembership(teamMembership ?? null);
  }, [teamId, allTeamMemberships]);

  useEffect(() => {
    const handleTeamEvent = (event: MessageEvent<TeamEvent>) => {
      if (event.data.type === "logout") {
        window.location.href = config.auth.redirectAfterLogout;
      } else if (event.data.type === "loaded") {
        setTeamId(event.data.teamId);
      }
    };

    teamBroadcastChannel.addEventListener("message", handleTeamEvent);

    return () =>
      teamBroadcastChannel.removeEventListener("message", handleTeamEvent);
  }, [teamId]);

  return (
    <teamContext.Provider
      value={{
        teamId,
        reloadTeamId,
        teamMembership,
        allTeamMemberships,
        user,
      }}
    >
      {children}
    </teamContext.Provider>
  );
}
