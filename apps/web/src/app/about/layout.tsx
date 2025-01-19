import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";

export default function AboutLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex flex-col">
			<Header />
			{children}
			<Footer />
		</div>
	);
}
