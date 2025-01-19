import { SecondaryMenu } from "@/components/settings/secondary-menu";
import type { PropsWithChildren } from "react";

export default async function SettingsLayout({ children }: PropsWithChildren) {
	return (
		<div className="container">
			<SecondaryMenu
				items={[
					{
						title: "General",
						href: "/settings/account/general",
					},
				]}
			/>
			<div className="mt-8">{children}</div>
		</div>
	);
}
