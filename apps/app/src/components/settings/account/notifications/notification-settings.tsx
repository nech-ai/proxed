"use client";

import { Skeleton } from "@proxed/ui/components/skeleton";
import { NotificationSetting } from "./notification-setting";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { RouterOutputs } from "@/trpc/types";

type NotificationPreference =
	RouterOutputs["notifications"]["preferences"][number];

export function NotificationSettingsSkeleton() {
	return [...Array(2)].map((_, index) => (
		<Skeleton key={index.toString()} className="mb-3 h-4 w-[25%]" />
	));
}

export function NotificationSettings() {
	const trpc = useTRPC();
	const { data: subscriberPreferences } = useSuspenseQuery(
		trpc.notifications.preferences.queryOptions(),
	);
	const preferences = (subscriberPreferences ?? []) as NotificationPreference[];

	const inAppSettings = preferences
		.filter((setting) =>
			Object.keys(setting.preference.channels ?? {}).includes("inApp"),
		)
		.map((setting) => {
			return (
				<NotificationSetting
					key={setting.template.id}
					id={setting.template.id}
					name={setting.template.name}
					enabled={Boolean(setting.preference.channels?.inApp)}
					type="inApp"
				/>
			);
		});

	const emailSettings = preferences
		.filter((setting) =>
			Object.keys(setting.preference.channels ?? {}).includes("email"),
		)
		.map((setting) => {
			return (
				<NotificationSetting
					key={setting.template.id}
					id={setting.template.id}
					name={setting.template.name}
					enabled={Boolean(setting.preference.channels?.email)}
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
