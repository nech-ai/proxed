"use client";

import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useUserQuery() {
	const trpc = useTRPC();
	return useSuspenseQuery(trpc.user.me.queryOptions());
}

export function useUserMutation() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	return useMutation(
		trpc.user.update.mutationOptions({
			onMutate: async (newData) => {
				await queryClient.cancelQueries({
					queryKey: trpc.user.me.queryKey(),
				});

				const previousData = queryClient.getQueryData(trpc.user.me.queryKey());

				queryClient.setQueryData(trpc.user.me.queryKey(), (old: any) => {
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
					trpc.user.me.queryKey(),
					context?.previousData,
				);
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.user.me.queryKey(),
				});
			},
		}),
	);
}
