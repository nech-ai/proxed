import { getPageImage, source } from "@/lib/source";
import {
	DocsPage,
	DocsBody,
	DocsTitle,
	DocsDescription,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { cn } from "@proxed/ui/lib/utils";
import type { ReactNode } from "react";

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;

	function Note({
		type = "info",
		className,
		children,
	}: {
		type?: "info" | "warning" | "success" | "error";
		className?: string;
		children: ReactNode;
	}) {
		const variant =
			type === "warning"
				? "border-amber-500/30 bg-amber-500/10 text-amber-200"
				: type === "success"
					? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
					: type === "error"
						? "border-red-500/30 bg-red-500/10 text-red-200"
						: "border-blue-500/30 bg-blue-500/10 text-blue-200";

		return (
			<div className={cn("rounded-md border p-3 text-sm", variant, className)}>
				{children}
			</div>
		);
	}

	return (
		<DocsPage toc={page.data.toc} full={page.data.full}>
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription>{page.data.description}</DocsDescription>
			<DocsBody>
				<MDX components={{ ...defaultMdxComponents, Note }} />
			</DocsBody>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(props: {
	params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const ogImage = getPageImage(page).url;

	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			type: "article",
			title: page.data.title,
			description: page.data.description,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: page.data.title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: page.data.title,
			description: page.data.description,
			images: [ogImage],
		},
	};
}
