import { SecondaryMenu } from "@/components/settings/secondary-menu";
import { ContentHeader } from "@/components/layout/content-header";
import type { PropsWithChildren } from "react";

export default async function SettingsLayout({ children }: PropsWithChildren) {
	return (
		<div className="flex flex-col h-full">
			<ContentHeader>
				<SecondaryMenu
					items={[
						{
							title: "General",
							href: "/settings/account/general",
						},
						{
							title: "Notifications",
							href: "/settings/account/notifications",
						},
						{
							title: "Support",
							href: "/settings/account/support",
						},
					]}
				/>
			</ContentHeader>
			<main className="flex-1 overflow-auto container mx-auto px-2 sm:px-4 py-8">
				{children}
			</main>
		</div>
	);
}
