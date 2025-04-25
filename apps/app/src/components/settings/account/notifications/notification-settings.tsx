import { getSubscriberPreferences } from "@proxed/notifications";
import { getUser } from "@proxed/supabase/cached-queries";
import { Skeleton } from "@proxed/ui/components/skeleton";
import { NotificationSetting } from "./notification-setting";

export function NotificationSettingsSkeleton() {
	return [...Array(2)].map((_, index) => (
		<Skeleton key={index.toString()} className="mb-3 h-4 w-[25%]" />
	));
}

export async function NotificationSettings() {
	const { data: userData } = await getUser();
	const { data: subscriberPreferences } = await getSubscriberPreferences({
		subscriberId: userData.id,
		teamId: userData.team_id,
	});
	const inAppSettings = subscriberPreferences
		?.filter((setting: any) =>
			Object.keys(setting.preference.channels).includes("in_app"),
		)
		.map((setting: any) => {
			return (
				<NotificationSetting
					key={setting.template._id}
					id={setting.template._id}
					name={setting.template.name}
					enabled={setting.preference.channels?.in_app}
					subscriberId={userData.id}
					teamId={userData.team_id}
					type="in_app"
				/>
			);
		});

	const emailSettings = subscriberPreferences
		?.filter((setting: any) =>
			Object.keys(setting.preference.channels).includes("email"),
		)
		.map((setting: any) => {
			return (
				<NotificationSetting
					key={setting.template._id}
					id={setting.template._id}
					name={setting.template.name}
					enabled={setting.preference.channels?.email}
					subscriberId={userData.id}
					teamId={userData.team_id}
					type="email"
				/>
			);
		});

	return (
		<div className="flex flex-col space-y-4">
			<div>
				<h2 className="mb-2">In-App Notifications</h2>
				{inAppSettings}
			</div>

			<div>
				<h2 className="mb-2">Email Notifications</h2>
				{emailSettings}
			</div>
		</div>
	);
}
