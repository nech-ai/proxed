import { getBlogPosts } from "@/lib/blog";
import type { MetadataRoute } from "next";
import { docsSource } from "./docs-source";

export const baseUrl = "https://proxed.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const blogs = getBlogPosts().map((post) => ({
		url: `${baseUrl}/updates/${post.slug}`,
		lastModified: post.metadata.publishedAt,
	}));

	const routes = ["", "/updates", "/about"].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	const docs = docsSource.getPages().map((page) => ({
		url: new URL(`/docs/${page.slugs.join("/")}`, baseUrl).href,
		lastModified: new Date(),
	}));

	return [...routes, ...blogs, ...docs];
}
