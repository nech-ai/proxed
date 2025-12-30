import { source } from "@/lib/source";
import type { MetadataRoute } from "next";
import { stat } from "node:fs/promises";

export const baseUrl = "https://docs.proxed.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const docs = await Promise.all(
		source.getPages().map(async (post) => {
			const { mtime } = await stat(post.data.info.fullPath);

			return {
				url: `${baseUrl}${post.url}`,
				lastModified: mtime,
			};
		}),
	);

	return [...docs];
}
