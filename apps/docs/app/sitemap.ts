import { source } from "@/lib/source";
import type { MetadataRoute } from "next";

export const baseUrl = "https://docs.proxed.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const docs = source.getPages().map((post) => ({
		url: `${baseUrl}${post.url}`,
		lastModified: post.data.lastModified,
	}));

	return [...docs];
}
