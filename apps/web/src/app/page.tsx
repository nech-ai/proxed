import { Community } from "@/components/sections/community";
import { CTA } from "@/components/sections/cta";
import { Examples } from "@/components/sections/examples";
import { Features } from "@/components/sections/features";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";

export default function Page() {
	return (
		<main>
			<Header />
			<Hero />
			<Examples />
			<Features />
			<Pricing />
			<Community />
			<CTA />
			<Footer />
		</main>
	);
}
