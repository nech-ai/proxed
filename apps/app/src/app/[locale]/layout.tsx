import { Toaster } from "@proxed/ui/components/toaster";
import { cn } from "@proxed/ui/utils";
import { Provider as JotaiProvider } from "jotai";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "@proxed/ui/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { I18nProviderClient } from "@/locales/client";

export const metadata: Metadata = {
	title: {
		absolute: "Proxed.AI",
		default: "Proxed.AI",
	},
};

const sansFont = Geist({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-sans",
});

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [{ media: "(prefers-color-scheme: dark)" }],
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					"min-h-screen bg-background font-sans text-foreground antialiased",
					sansFont.variable,
				)}
			>
				<NextTopLoader color="var(--colors-primary)" />
				<I18nProviderClient locale="en">
					<JotaiProvider>
						<NuqsAdapter>{children}</NuqsAdapter>
					</JotaiProvider>
				</I18nProviderClient>
				<Toaster />
			</body>
		</html>
	);
}
