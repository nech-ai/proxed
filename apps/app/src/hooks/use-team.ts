"use client";

import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useTeamQuery() {
	const trpc = useTRPC();
	return useSuspenseQuery(trpc.team.current.queryOptions());
}

export function useTeamMutation() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	return useMutation(
		trpc.team.update.mutationOptions({
			onMutate: async (newData) => {
				await queryClient.cancelQueries({
					queryKey: trpc.team.current.queryKey(),
				});

				const previousData = queryClient.getQueryData(
					trpc.team.current.queryKey(),
				);

				queryClient.setQueryData(trpc.team.current.queryKey(), (old: any) => {
					if (!old) return old;
					return {
						...old,
						...newData,
					};
				});

				return { previousData };
			},
			onError: (_error, _newData, context) => {
				queryClient.setQueryData(
					trpc.team.current.queryKey(),
					context?.previousData,
				);
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.team.current.queryKey(),
				});
			},
		}),
	);
}
