"use client";

import { Tabs, TabsList, TabsTrigger } from "@proxed/ui/components/tabs";

export default function SigninModeSwitch({
	activeMode,
	onChangeAction,
	className,
}: {
	activeMode: "password" | "magic-link";
	onChangeAction: (mode: string) => void;
	className?: string;
}) {
	return (
		<Tabs
			value={activeMode}
			onValueChange={onChangeAction}
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
