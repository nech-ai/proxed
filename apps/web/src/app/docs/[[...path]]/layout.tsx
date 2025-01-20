import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { docsSource } from "../../docs-source";

export default function DocumentationLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="pt-[4.5rem]">
			<DocsLayout
				tree={docsSource.pageTree}
				disableThemeSwitch
				nav={{
					title: <strong>Documentation</strong>,
					url: "/docs",
				}}
				sidebar={{
					defaultOpenLevel: 1,
				}}
			>
				{children}
			</DocsLayout>
		</div>
	);
}
