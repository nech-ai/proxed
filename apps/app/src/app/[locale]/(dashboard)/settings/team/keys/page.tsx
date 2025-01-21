import { ProviderKeyCreateForm } from "@/components/settings/team/keys/provider-keys-create";
import { ProviderKeysBlock } from "@/components/settings/team/keys/provider-keys";
import { getProviderKeys } from "@proxed/supabase/cached-queries";

export async function generateMetadata() {
	return {
		title: "Partial Keys",
	};
}

export default async function Page() {
	const providerKeys = await getProviderKeys();

	if (!providerKeys || !providerKeys.data) {
		return <div>No provider keys found</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-6">
			<ProviderKeyCreateForm revalidatePath="/settings/team/keys" />
			<ProviderKeysBlock providerKeys={providerKeys.data} />
		</div>
	);
}
