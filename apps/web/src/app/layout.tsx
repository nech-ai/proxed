import { cn } from "@proxed/ui/lib/utils";
import { SiteBanner } from "@proxed/ui/components/site-banner";
import { SITE_COPY } from "@proxed/utils/lib/site";
import { Geist, Geist_Mono } from "next/font/google";
import PlausibleProvider from "next-plausible";
import type { Viewport } from "next";
import "@proxed/ui/globals.css";
import { generateMetadata, jsonLd } from "@/lib/metadata";
import { AnalyticsProvider } from "@proxed/analytics/client";

export const metadata = generateMetadata();

export const viewport: Viewport = {
	colorScheme: "dark",
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

const sansFont = Geist({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-sans",
});

const monoFont = Geist_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-mono",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<PlausibleProvider domain="proxed.ai" />
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: known good
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd),
					}}
				/>
			</head>
			<body
				className={cn(
					"min-h-screen bg-black text-white antialiased",
					sansFont.variable,
					monoFont.variable,
				)}
			>
				<SiteBanner className="sticky top-0 z-[60] bg-zinc-950/90 text-zinc-100 border-zinc-800">
					{SITE_COPY.banner}
				</SiteBanner>
				{children}
				<AnalyticsProvider />
			</body>
		</html>
	);
}
