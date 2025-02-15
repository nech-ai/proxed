import { ArticleInView } from "@/components/article-in-view";
import { CustomMDX } from "@/components/mdx";
import { PostStatus } from "@/components/post-status";
import { cn } from "@proxed/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { GradientText } from "./gradient-text";

interface ArticleMetadata {
	tag: string;
	title: string;
	image?: string;
	publishedAt: string;
}

interface ArticleData {
	slug: string;
	metadata: ArticleMetadata;
	content: string;
}

interface ArticleProps {
	firstPost: boolean;
	data: ArticleData;
	className?: string;
}

function ArticleHeader({
	metadata,
	slug,
	firstPost,
}: { metadata: ArticleMetadata; slug: string; firstPost: boolean }) {
	return (
		<header className="space-y-4">
			<PostStatus status={metadata.tag} />
			<Link
				className="group/title"
				href={`/updates/${slug}`}
				prefetch={firstPost}
			>
				<GradientText as="h2" className="font-medium text-4xl">
					{metadata.title}
				</GradientText>
			</Link>
			<time
				dateTime={metadata.publishedAt}
				className="text-sm text-gray-400 block"
			>
				{new Date(metadata.publishedAt).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				})}
			</time>
		</header>
	);
}

function ArticleImage({
	src,
	alt,
	firstPost,
}: { src: string; alt: string; firstPost: boolean }) {
	return (
		<div className="relative overflow-hidden border border-gray-800 flex justify-center">
			<Image
				src={src}
				alt={alt}
				width={680}
				height={442}
				className="transition-transform group-hover:scale-105 duration-500 object-cover"
				loading={firstPost ? "eager" : "lazy"}
				sizes="(min-width: 1280px) 680px, (min-width: 1024px) 580px, (min-width: 768px) 480px, 100vw"
			/>
		</div>
	);
}

export function Article({ data, firstPost, className }: ArticleProps) {
	return (
		<div
			id={data.slug}
			className={cn(
				"border border-gray-800 bg-black/50 p-8 backdrop-blur first:mt-0 mt-16",
				className,
			)}
		>
			<article className="space-y-6">
				<ArticleInView slug={data.slug} firstPost={firstPost} />
				<ArticleHeader
					metadata={data.metadata}
					slug={data.slug}
					firstPost={firstPost}
				/>

				<div className="prose prose-invert prose-gray max-w-none">
					{data.metadata.image && (
						<ArticleImage
							src={data.metadata.image}
							alt={data.metadata.title}
							firstPost={firstPost}
						/>
					)}
					<div className="mt-6">
						<CustomMDX source={data.content} />
					</div>
				</div>
			</article>
		</div>
	);
}
