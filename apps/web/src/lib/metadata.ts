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
    "Proxed.AI - Secure iOS API with DeviceCheck for AI Models";
  const defaultDescription =
    "Build secure AI wrappers with Proxed.AI - an iOS SDK with Apple DeviceCheck integration that safely manages API keys and unifies ChatGPT, Claude, LLaMA, and Mistral models. Start building for free during Beta.";

  const defaultKeywords = [
    "iOS SDK",
    "DeviceCheck",
    "Secure API keys",
    "AI key management",
    "ChatGPT SDK",
    "Claude SDK",
    "LLaMA SDK",
    "Mistral SDK",
    "iOS security",
    "AI integration",
    "mobile AI",
    "key rotation",
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
          alt: "Proxed.AI iOS API Protection",
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
      site: "@proxed_ai",
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
    "Secure iOS API with DeviceCheck integration that safely manages API keys and unifies ChatGPT, Claude, LLaMA, and Mistral models in one interface",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free during Beta",
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
    "Apple DeviceCheck Integration, Secure Key Management, Key Rotation, ChatGPT Integration, Claude Integration, LLaMA Integration, Vision Structured Response, iOS Development",
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
    sameAs: ["https://github.com/proxed-ai/proxed", "https://x.com/proxed_ai"],
  },
  category: "AI Security & Development Tools",
  applicationSubCategory: "Secure iOS SDK for AI Models",
  releaseNotes: "https://proxed.ai/updates",
};
