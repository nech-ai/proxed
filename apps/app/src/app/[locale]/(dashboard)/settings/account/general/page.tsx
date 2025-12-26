import { ChangeAvatar } from "@/components/settings/account/general/change-avatar";
import { ChangeEmail } from "@/components/settings/account/general/change-email";
import { DeleteAccount } from "@/components/settings/account/general/delete-account";
import { DisplayName } from "@/components/settings/account/general/display-name";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export async function generateMetadata() {
	return {
		title: "Account Settings | Proxed",
	};
}

export default async function AccountSettingsPage() {
	batchPrefetch([trpc.user.me.queryOptions()]);

	return (
		<HydrateClient>
			<div className="grid grid-cols-1 gap-6">
				<ChangeAvatar />
				<DisplayName />
				<ChangeEmail />
				<DeleteAccount />
			</div>
		</HydrateClient>
	);
}
