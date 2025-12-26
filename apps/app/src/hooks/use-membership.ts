"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useMembershipQuery() {
	const trpc = useTRPC();
	const query = useSuspenseQuery(trpc.user.membership.queryOptions());
	const role = query.data?.role;

	return {
		...query,
		role,
		isOwner: role === "OWNER",
		isMember: role === "MEMBER",
	};
}
