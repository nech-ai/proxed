import { getBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/config";
import type { MetadataRoute } from "next";

export const baseUrl = "https://proxed.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const blogs = getBlogPosts().map((post) => ({
		url: `${baseUrl}/updates/${post.slug}`,
		lastModified: post.metadata.publishedAt,
	}));

	const features = siteConfig.features.map((feature) => ({
		url: `${baseUrl}${feature.href}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	const routes = ["", "/updates", "/about"].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...blogs, ...features];
}
