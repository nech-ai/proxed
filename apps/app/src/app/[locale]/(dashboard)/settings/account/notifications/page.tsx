import { NotificationsSettingsList } from "@/components/settings/account/notifications/notifications-settings-list";

export async function generateMetadata() {
	return {
		title: "Notifications | Proxed",
	};
}

export default async function AccountNotificationsPage() {
	return (
		<div className="grid grid-cols-1 gap-6">
			<NotificationsSettingsList />
		</div>
	);
}
