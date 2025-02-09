import { Article } from "@/components/article";
import { UpdatesToolbar } from "@/components/updates-toolbar";
import { Section } from "@/components/section";
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
		<div className="flex justify-center py-12">
			<Section id="updates" className="flex-1" noBorder>
				<div className="flex gap-8">
					<div className="space-y-16 flex-1">{posts}</div>
					<UpdatesToolbar
						posts={data.map((post) => ({
							slug: post.slug,
							title: post.metadata.title,
						}))}
					/>
				</div>
			</Section>
		</div>
	);
}
