import { cn } from "fumadocs-ui/components/api";
import { RootProvider } from "fumadocs-ui/provider";
import "fumadocs-ui/style.css";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

const sansFont = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
});

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
