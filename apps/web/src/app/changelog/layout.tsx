import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { BackToTopButton } from "@/components/back-to-top-button";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main>
			<Header />
			{children}
			<Footer />
			<BackToTopButton />
		</main>
	);
}
