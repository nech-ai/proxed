"use client";

import { useEffect } from "react";
import { TeamContext, type TeamProps, createTeamStore } from "./store";

type TeamProviderProps = React.PropsWithChildren<TeamProps>;

export function TeamProvider({ children, data }: TeamProviderProps) {
	const store = createTeamStore({ data });

	useEffect(() => {
		if (data) {
			store.setState({ data });
		}
	}, [data, store]);

	return <TeamContext.Provider value={store}>{children}</TeamContext.Provider>;
}
