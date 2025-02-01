import { baseUrl } from "./sitemap";

export default function robots() {
	return {
		rules: [
			{
				userAgent: "*",
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
