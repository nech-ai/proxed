"use client";

import { updateSubscriberPreferenceAction } from "@/actions/update-subscriber-preference-action";
import { useI18n } from "@/locales/client";
import { Label } from "@proxed/ui/components/label";
import { Switch } from "@proxed/ui/components/switch";
import { useOptimisticAction } from "next-safe-action/hooks";

type Props = {
	id: string;
	name: string;
	enabled: boolean;
	subscriberId: string;
	teamId: string;
	type: string;
};

export function NotificationSetting({
	id,
	name,
	enabled,
	subscriberId,
	teamId,
	type,
}: Props) {
	const t = useI18n();
	const { execute, optimisticState } = useOptimisticAction(
		updateSubscriberPreferenceAction,
		{
			currentState: { enabled },
			updateFn: (state) => {
				return {
					...state,
					enabled: !state.enabled,
				};
			},
		},
	);

	const onChange = () => {
		execute({
			templateId: id,
			type,
			revalidatePath: "/settings/account/notifications-beta",
			subscriberId,
			teamId,
			enabled: !enabled,
		});
	};

	return (
		<div className="mb-4 flex flex-row items-center justify-between border-b-[1px] pb-4">
			<div className="space-y-0.5">
				<Label htmlFor={id}>
					{/* @ts-expect-error */}
					{t(`notifications.${name}.title`)}
				</Label>
				<p className="text-[#606060] text-sm">
					{/* @ts-expect-error */}
					{t(`notifications.${name}.description`)}
				</p>
			</div>
			<Switch
				id={id}
				checked={optimisticState.enabled}
				onCheckedChange={onChange}
			/>
		</div>
	);
}
