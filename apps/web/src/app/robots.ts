import { baseUrl } from "./sitemap";

export default function robots() {
	return {
		rules: [
			{
				userAgent: "*",
			},
			{
				userAgent: "*",
				allow: "/docs",
			},
			{
				userAgent: "*",
				disallow: "/og/*",
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: `${baseUrl}`,
	};
}
