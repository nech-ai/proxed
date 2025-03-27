import { useContext } from "react";
import { useStore } from "zustand";
import { TeamContext, type TeamState } from "./store";

export function useTeamContext<T>(selector: (state: TeamState) => T): T {
	const store = useContext(TeamContext);

	if (!store) {
		throw new Error("Missing TeamContext.Provider in the tree");
	}

	return useStore(store, selector);
}
