import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";
import { getChangelogChanges } from "@/lib/changelog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { GradientText } from "@/components/gradient-text";

export async function generateStaticParams() {
	const entries = getChangelogChanges();

	return entries.map((entry) => ({
		slug: entry.slug,
	}));
}

export async function generateMetadata(props: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
	const params = await props.params;
	const entry = getChangelogChanges().find((e) => e.slug === params.slug);
	if (!entry) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		// image handling removed
	} = entry.metadata;

	return {
		title: `${title} | Changelog`,
		description,
		alternates: {
			canonical: `${baseUrl}/changelog/${entry.slug}`,
		},
		openGraph: {
			title: `${title} | Changelog`,
			description,
			type: "article",
			publishedTime,
			url: `${baseUrl}/changelog/${entry.slug}`,
		},
		twitter: {
			card: "summary",
			title: `${title} | Changelog`,
			description,
		},
	};
}

export default async function Page(props: {
	params: Promise<{ slug: string }>;
}) {
	const params = await props.params;
	const entry = getChangelogChanges().find((p) => p.slug === params.slug);

	if (!entry) {
		notFound();
	}

	return (
		<div className="flex justify-center py-12">
			<script
				type="application/ld+json"
				suppressHydrationWarning
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Article",
						headline: entry.metadata.title,
						datePublished: entry.metadata.publishedAt,
						dateModified: entry.metadata.publishedAt,
						description: entry.metadata.summary,
						url: `${baseUrl}/changelog/${entry.slug}`,
					}),
				}}
			/>

			<Section id={entry.slug} className="flex-1" noBorder>
				<div className="border border-gray-800 bg-black/50 p-8 backdrop-blur">
					<article className="space-y-6">
						<div className="space-y-4">
							<GradientText as="h1" className="font-medium text-4xl">
								{entry.metadata.title}
							</GradientText>
							<time className="text-sm text-gray-400 block">
								{new Date(entry.metadata.publishedAt).toLocaleDateString(
									"en-US",
									{
										year: "numeric",
										month: "long",
										day: "numeric",
									},
								)}
							</time>
						</div>

						<div className="prose prose-invert prose-gray max-w-none">
							<CustomMDX source={entry.content} />
						</div>
					</article>
				</div>
			</Section>
		</div>
	);
}
