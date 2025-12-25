"use client";

import { useI18n } from "@/locales/client";
import { Label } from "@proxed/ui/components/label";
import { Switch } from "@proxed/ui/components/switch";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

type Props = {
	id: string;
	name: string;
	enabled: boolean;
	type: "inApp" | "email";
};

export function NotificationSetting({ id, name, enabled, type }: Props) {
	const t = useI18n();
	const trpc = useTRPC();
	const [checked, setChecked] = useState(enabled);

	const updatePreference = useMutation(
		trpc.notifications.updatePreference.mutationOptions({
			onError: () => {
				setChecked((prev) => !prev);
			},
		}),
	);

	const onChange = () => {
		const nextValue = !checked;
		setChecked(nextValue);
		updatePreference.mutate({
			templateId: id,
			type,
			enabled: nextValue,
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
				checked={checked}
				onCheckedChange={onChange}
				disabled={updatePreference.isPending}
			/>
		</div>
	);
}
