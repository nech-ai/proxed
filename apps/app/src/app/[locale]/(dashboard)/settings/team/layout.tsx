import { SecondaryMenu } from "@/components/settings/secondary-menu";
import { ContentHeader } from "@/components/layout/content-header";
import type { PropsWithChildren } from "react";

export default async function SettingsLayout({ children }: PropsWithChildren) {
	return (
		<>
			<ContentHeader>
				<SecondaryMenu
					items={[
						{
							title: "General",
							href: "/settings/team/general",
						},
						{
							title: "Members",
							href: "/settings/team/members",
						},
						{
							title: "Device Checks",
							href: "/settings/team/device-check",
						},
						{
							title: "Partial Keys",
							href: "/settings/team/keys",
						},
					]}
				/>
			</ContentHeader>
			<main className="container mx-auto px-2 sm:px-4 py-8">{children}</main>
		</>
	);
}
