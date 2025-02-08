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
		};
		content: string;
	};
};

export function Article({ data, firstPost }: Props) {
	return (
		<article
			key={data.slug}
			className="relative mb-8 backdrop-blur-xl group"
			id={data.slug}
		>
			<ArticleInView slug={data.slug} firstPost={firstPost} />

			<div className="border border-gray-800 bg-black/50 p-8 backdrop-blur transition-colors hover:border-gray-700">
				<PostStatus status={data.metadata.tag} />
				<Link className="mb-6 block group" href={`/updates/${data.slug}`}>
					<h2 className="font-medium text-3xl mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent transition-opacity group-hover:opacity-80">
						{data.metadata.title}
					</h2>
				</Link>

				<div className="prose prose-invert prose-gray max-w-none">
					{data.metadata.image && (
						<div className="relative overflow-hidden border border-gray-800 flex justify-center">
							<Image
								src={data.metadata.image}
								alt={data.metadata.title}
								width={680}
								height={442}
								className="transition-transform hover:scale-105 duration-500 object-cover"
							/>
						</div>
					)}

					<CustomMDX source={data.content} />
				</div>
			</div>
		</article>
	);
}
