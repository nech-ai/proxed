import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main>
			<Header />
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1">
				{children}
			</div>
			<Footer />
		</main>
	);
}
