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
	imageWidth?: number;
	imageHeight?: number;
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
	imageWidth,
	imageHeight,
	firstPost,
}: {
	src: string;
	alt: string;
	imageWidth?: number;
	imageHeight?: number;
	firstPost: boolean;
}) {
	return (
		<div className="relative w-full my-6 group">
			<div className="absolute inset-0 overflow-hidden">
				<Image
					src={src}
					alt=""
					layout="fill"
					objectFit="cover"
					className="transform scale-150 blur-2xl opacity-40 pointer-events-none"
					aria-hidden="true"
					loading={firstPost ? "eager" : "lazy"}
				/>
			</div>
			<div className="relative z-10 flex justify-center py-6">
				<div className="max-w-[calc(100%-30px)]">
					<Image
						src={src}
						alt={alt}
						width={imageWidth || 600}
						height={imageHeight || 400}
						objectFit="contain"
						className="block w-auto h-auto max-h-[560px] rounded-md shadow-lg transition-transform duration-300 group-hover:scale-105"
						loading={firstPost ? "eager" : "lazy"}
						sizes="(min-width: 1280px) 500px, (min-width: 1024px) 400px, (min-width: 768px) 300px, 100vw"
					/>
				</div>
			</div>
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
							imageWidth={data.metadata.imageWidth}
							imageHeight={data.metadata.imageHeight}
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
