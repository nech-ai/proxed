"use client";

import { ActionBlock } from "@/components/shared/action-block";
import { ProviderKeysList } from "./provider-keys-list";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function ProviderKeysBlock() {
	const trpc = useTRPC();
	const { data: providerKeys = [] } = useQuery(
		trpc.providerKeys.list.queryOptions(),
	);

	return (
		<div className="space-y-6">
			<ActionBlock title="Partial Keys">
				<ProviderKeysList providerKeys={providerKeys} />
			</ActionBlock>
		</div>
	);
}
