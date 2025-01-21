"use client";

import { ActionBlock } from "@/components/shared/action-block";
import type { Tables } from "@proxed/supabase/types";
import { ProviderKeysList } from "./provider-keys-list";

export function ProviderKeysBlock({
	providerKeys,
}: {
	providerKeys: Partial<Tables<"provider_keys">>[];
}) {
	return (
		<div className="space-y-6">
			<ActionBlock title="Partial Keys">
				<ProviderKeysList providerKeys={providerKeys} />
			</ActionBlock>
		</div>
	);
}
