import { ProviderKeyCreateForm } from "@/components/settings/team/keys/provider-keys-create";
import { ProviderKeysBlock } from "@/components/settings/team/keys/provider-keys";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export async function generateMetadata() {
	return {
		title: "Partial Keys | Proxed",
	};
}

export default async function Page() {
	batchPrefetch([trpc.providerKeys.list.queryOptions()]);

	return (
		<HydrateClient>
			<div className="grid grid-cols-1 gap-6">
				<ProviderKeyCreateForm />
				<ProviderKeysBlock />
			</div>
		</HydrateClient>
	);
}
