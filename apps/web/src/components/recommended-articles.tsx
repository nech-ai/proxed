import Link from "next/link";
import Image from "next/image";
import { GradientText } from "./gradient-text";
import { cn } from "@proxed/ui/lib/utils";

interface PostMetadata {
	title: string;
	image?: string;
	tag: string;
	summary: string; // Added for potential future use, though not used in current card design
	publishedAt: string; // Added for potential future use
}

interface RecommendedPost {
	slug: string;
	metadata: PostMetadata;
}

interface RecommendedArticlesProps {
	posts: RecommendedPost[];
	className?: string;
}

export function RecommendedArticles({
	posts,
	className,
}: RecommendedArticlesProps) {
	if (!posts || posts.length === 0) {
		return null;
	}

	return (
		<section className={cn("py-12", className)}>
			<GradientText as="h2" className="text-3xl font-medium mb-8 text-center">
				You Might Also Like
			</GradientText>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{posts.map((post) => (
					<Link
						href={`/updates/${post.slug}`}
						key={post.slug}
						className="block group"
						legacyBehavior
					>
						<div className="border border-gray-800 bg-black/30 p-6 rounded-lg hover:bg-black/50 transition-colors duration-300 space-y-4 h-full flex flex-col justify-between">
							<div>
								{post.metadata.image && (
									<div className="relative aspect-video overflow-hidden rounded-md border border-gray-700 mb-4">
										<Image
											src={post.metadata.image}
											alt={post.metadata.title}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											className="object-cover transition-transform duration-500 group-hover:scale-105"
										/>
									</div>
								)}
								<h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors mb-2">
									{post.metadata.title}
								</h3>
							</div>
							<span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full self-start">
								{post.metadata.tag}
							</span>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
