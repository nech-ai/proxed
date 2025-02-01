import { docsSource } from "@/app/docs-source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/docs/layout.config";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout tree={docsSource.pageTree} {...baseOptions}>
			{children}
		</DocsLayout>
	);
}
