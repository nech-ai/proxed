import { teamContext } from "@/shared/lib/team-context";
import { useContext } from "react";

export function useTeam() {
  const context = useContext(teamContext);
  if (!context) {
    throw new Error("useTeam must be used within TeamContextProvider");
  }
  return context;
}
