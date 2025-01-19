import { Article } from "@/components/article";
import { UpdatesToolbar } from "@/components/updates-toolbar";
import { getBlogPosts } from "@/lib/blog";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
	title: "Product Updates & Engineering Blog | Proxed.AI",
	description:
		"Stay updated on Proxed.AI's development journey. Read about our latest features, engineering insights, and product announcements as we build the future of AI model management.",
	path: "/updates",
});

export default async function Page() {
	const data = getBlogPosts();

	const posts = data
		.sort((a, b) => {
			if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
				return -1;
			}
			return 1;
		})
		.map((post, index) => (
			<Article data={post} firstPost={index === 0} key={post.slug} />
		));

	return (
		<div className="flex justify-center py-4 md:py-12">
			<div className="max-w-[980px] w-full">
				<div className="space-y-16">{posts}</div>
			</div>

			<UpdatesToolbar
				posts={data.map((post) => ({
					slug: post.slug,
					title: post.metadata.title,
				}))}
			/>
		</div>
	);
}
