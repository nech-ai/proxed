import type { Metadata } from "next";

interface GenerateMetadataProps {
	title?: string;
	description?: string;
	path?: string;
	ogImage?: string;
	noIndex?: boolean;
}

export function generateMetadata({
	title,
	description,
	path = "",
	ogImage = "/opengraph-image.png",
	noIndex = false,
}: GenerateMetadataProps = {}): Metadata {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://proxed.ai";

	// Ensure path starts with a slash and normalize it
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const fullUrl = `${baseUrl}${normalizedPath}`;

	const defaultTitle =
		"Proxed.AI - Secure AI APIs in Seconds—No SDK, No Backend Needed";
	const defaultDescription =
		"Proxed.AI is the simplest way to protect AI API keys in iOS apps. Lock down your API credentials, verify device authenticity with Apple's DeviceCheck, and structure AI outputs—all without a backend.";

	const defaultKeywords = [
		"AI API Security",
		"iOS AI Integration",
		"DeviceCheck",
		"LLM API Protection",
		"No SDK",
		"No Backend",
		"API Key Protection",
		"iOS Security",
		"AI Cost Control",
		"Rate Limiting",
		"Structured AI Responses",
		"API Proxy",
	];

	return {
		metadataBase: new URL(baseUrl),
		title: {
			absolute: title || defaultTitle,
			default: defaultTitle,
			template: "%s | Proxed.AI",
		},
		applicationName: "Proxed.AI",

		description: description || defaultDescription,
		alternates: {
			canonical: normalizedPath,
			languages: {
				"en-GB": normalizedPath,
			},
		},
		openGraph: {
			title: title || defaultTitle,
			description: description || defaultDescription,
			url: fullUrl,
			siteName: "Proxed.AI",
			images: [
				{
					url: ogImage,
					width: 800,
					height: 600,
					alt: "Proxed.AI - Secure AI APIs in Seconds",
				},
			],
			locale: "en_GB",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: title || defaultTitle,
			description: description || defaultDescription,
			images: [{ url: ogImage }],
			creator: "@vahaah",
			site: "@vahaah",
		},
		robots: {
			index: !noIndex,
			follow: !noIndex,
			googleBot: {
				index: !noIndex,
				follow: !noIndex,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		authors: [{ name: "Alex Vakhitov" }],
		creator: "Alex Vakhitov",
		publisher: "Alex Vakhitov",
		keywords: defaultKeywords,
		icons: {
			icon: "/favicon.ico",
			apple: "/apple-touch-icon.png",
		},
		other: {
			"twitter:label1": "Security",
			"twitter:data1": "DeviceCheck & Secure Keys",
			"twitter:label2": "Available for",
			"twitter:data2": "iOS Development",
		},
	};
}

export const jsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "Proxed.AI",
	applicationCategory: "DeveloperApplication",
	operatingSystem: "iOS",
	description:
		"Secure AI APIs in Seconds—No SDK, No Backend Needed. Proxed.AI is the simplest way to protect AI API keys in iOS apps with DeviceCheck authentication.",
	offers: {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD",
		description: "Free tier available",
	},
	aggregateRating: {
		"@type": "AggregateRating",
		ratingValue: "5",
		ratingCount: "1",
	},
	url: "https://proxed.ai",
	image: "https://proxed.ai/icon.png",
	applicationSuite: "Secure AI SDK",
	featureList:
		"No SDK Required, No Backend Required, Apple DeviceCheck Integration, Secure Key Management, Rate Limiting, AI Cost Control, Structured AI Responses",
	softwareVersion: "1.0",
	author: {
		"@type": "Person",
		name: "Alex Vakhitov",
		sameAs: ["https://x.com/vahaah"],
	},
	provider: {
		"@type": "Organization",
		name: "Proxed.AI",
		url: "https://proxed.ai",
		sameAs: ["https://github.com/nech-ai/proxed", "https://x.com/vahaah"],
	},
	category: "AI Security & Development Tools",
	applicationSubCategory: "API Security for iOS AI Integration",
	releaseNotes: "https://proxed.ai/updates",
};
