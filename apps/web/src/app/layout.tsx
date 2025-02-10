import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@proxed/ui/lib/utils";
import { Geist, Geist_Mono } from "next/font/google";
import PlausibleProvider from "next-plausible";
import type { Viewport } from "next";
import "@proxed/ui/globals.css";
import { generateMetadata, jsonLd } from "@/lib/metadata";
import { config } from "@config";
import { SubscribeModalProvider } from "@/context/subscribe-modal-context";
import { SubscribeModal } from "@/components/subscribe-modal";

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
				<ThemeProvider forcedTheme={config.ui.defaultTheme}>
					<SubscribeModalProvider>
						{children}
						<SubscribeModal />
					</SubscribeModalProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
