import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";
import { PostAuthor } from "@/components/post-author";
import { PostStatus } from "@/components/post-status";
import { getBlogPosts } from "@/lib/blog";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { GradientText } from "@/components/gradient-text";
import { RecommendedArticles } from "@/components/recommended-articles";

export async function generateStaticParams() {
	const posts = getBlogPosts();

	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata(props: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
	const params = await props.params;
	const post = getBlogPosts().find((post) => post.slug === params.slug);
	if (!post) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = post.metadata;

	return {
		title: `${title}`,
		description,
		alternates: {
			canonical: `${baseUrl}/updates/${post.slug}`,
		},
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime,
			url: `${baseUrl}/updates/${post.slug}`,
			images: [
				{
					url: image!,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [image!],
		},
	};
}

export default async function Page(props: {
	params: Promise<{ slug: string }>;
}) {
	const params = await props.params;
	const allPosts = getBlogPosts();
	const post = allPosts.find((p) => p.slug === params.slug);

	if (!post) {
		notFound();
	}

	const recommendedPostsData = allPosts
		.filter((p) => p.slug !== post.slug)
		.sort(
			(a, b) =>
				new Date(b.metadata.publishedAt).getTime() -
				new Date(a.metadata.publishedAt).getTime(),
		)
		.slice(0, 3);

	return (
		<div className="flex justify-center py-12">
			<script
				type="application/ld+json"
				suppressHydrationWarning
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BlogPosting",
						headline: post.metadata.title,
						datePublished: post.metadata.publishedAt,
						dateModified: post.metadata.publishedAt,
						description: post.metadata.summary,
						image: `${baseUrl}${post.metadata.image}`,
						url: `${baseUrl}/updates/${post.slug}`,
					}),
				}}
			/>

			<Section id={post.slug} className="flex-1" noBorder>
				<div className="border border-gray-800 bg-black/50 p-8 backdrop-blur">
					<article className="space-y-6">
						<div className="space-y-4">
							<PostStatus status={post.metadata.tag} />
							<GradientText as="h1" className="font-medium text-4xl">
								{post.metadata.title}
							</GradientText>
							<time className="text-sm text-gray-400 block">
								{new Date(post.metadata.publishedAt).toLocaleDateString(
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
							{post.metadata.image && (
								<div className="relative w-full my-8 group">
									{/* Halo Background Image - Spreads wide */}
									<div className="absolute inset-0 overflow-hidden">
										<Image
											src={post.metadata.image} // Use the same image source
											alt="" // Decorative
											layout="fill"
											objectFit="cover"
											className="transform scale-150 blur-3xl opacity-40 pointer-events-none"
											aria-hidden="true"
											priority={true} // Match main image priority
										/>
									</div>

									{/* Main Image Container - Centered with max-height */}
									<div className="relative z-10 flex justify-center py-10">
										<div className="max-w-[calc(100%-40px)]">
											<Image
												src={post.metadata.image}
												alt={post.metadata.title}
												width={post.metadata.imageWidth || 800} // Fallback width
												height={post.metadata.imageHeight || 600} // Fallback height, will be constrained by max-h-96 or max-h-[440px]
												objectFit="contain"
												className="block w-auto h-auto max-h-[440px] rounded-md shadow-2xl transition-transform duration-300 group-hover:scale-105"
												priority={true}
											/>
										</div>
									</div>
								</div>
							)}
							<CustomMDX source={post.content} />
						</div>

						<div className="mt-10 pt-6 border-t border-gray-800">
							<PostAuthor author="alex" />
						</div>
					</article>
				</div>

				{recommendedPostsData.length > 0 && (
					<div className="mt-16">
						<RecommendedArticles posts={recommendedPostsData} />
					</div>
				)}
			</Section>
		</div>
	);
}
