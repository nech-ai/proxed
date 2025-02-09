import { ArticleInView } from "@/components/article-in-view";
import { CustomMDX } from "@/components/mdx";
import { PostStatus } from "@/components/post-status";
import Image from "next/image";
import Link from "next/link";

type Props = {
	firstPost: boolean;
	data: {
		slug: string;
		metadata: {
			tag: string;
			title: string;
			image?: string;
			publishedAt: string;
		};
		content: string;
	};
};

export function Article({ data, firstPost }: Props) {
	return (
		<div
			id={data.slug}
			className="border border-gray-800 bg-black/50 p-8 backdrop-blur first:mt-0 mt-16"
		>
			<article className="space-y-6">
				<ArticleInView slug={data.slug} firstPost={firstPost} />

				<header className="space-y-4">
					<PostStatus status={data.metadata.tag} />
					<Link
						className="group/title"
						href={`/updates/${data.slug}`}
						prefetch={firstPost}
					>
						<h2 className="font-medium text-4xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
							{data.metadata.title}
						</h2>
					</Link>
					<time
						dateTime={data.metadata.publishedAt}
						className="text-sm text-gray-400 block"
					>
						{new Date(data.metadata.publishedAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</time>
				</header>

				<div className="prose prose-invert prose-gray max-w-none">
					{data.metadata.image && (
						<div className="relative overflow-hidden border border-gray-800 flex justify-center">
							<Image
								src={data.metadata.image}
								alt={data.metadata.title}
								width={680}
								height={442}
								className="transition-transform group-hover:scale-105 duration-500 object-cover"
								loading={firstPost ? "eager" : "lazy"}
								sizes="(min-width: 1280px) 680px, (min-width: 1024px) 580px, (min-width: 768px) 480px, 100vw"
							/>
						</div>
					)}
					<div className="mt-6">
						<CustomMDX source={data.content} />
					</div>
				</div>
			</article>
		</div>
	);
}
