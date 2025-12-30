import { RootProvider } from "fumadocs-ui/provider/next";
import "fumadocs-ui/style.css";
import { cn } from "@proxed/ui/lib/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

const sansFont = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://docs.proxed.ai"),
};

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={cn(sansFont.variable)} suppressHydrationWarning>
			<body
				style={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
				}}
			>
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
