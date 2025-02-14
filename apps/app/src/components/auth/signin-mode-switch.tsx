"use client";

import { Tabs, TabsList, TabsTrigger } from "@proxed/ui/components/tabs";

type SigninMode = "password" | "magic-link";

export default function SigninModeSwitch({
	activeMode,
	onChangeAction,
	className,
}: {
	activeMode: SigninMode;
	onChangeAction: (mode: SigninMode) => void;
	className?: string;
}) {
	return (
		<Tabs
			value={activeMode}
			onValueChange={(value) => onChangeAction(value as SigninMode)}
			className={className}
		>
			<TabsList className="w-full">
				<TabsTrigger value="password" className="flex-1">
					Password
				</TabsTrigger>
				<TabsTrigger value="magic-link" className="flex-1">
					Magic link
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
