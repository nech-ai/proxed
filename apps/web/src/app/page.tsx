import { Community } from "@/components/sections/community";
import { CTA } from "@/components/sections/cta";
import { Examples } from "@/components/sections/examples";
import { Features } from "@/components/sections/features";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { ProblemSolution } from "@/components/sections/problem-solution";

export default function Page() {
	return (
		<main className="flex flex-col gap-12">
			<Header />
			<Hero />
			<Examples />
			<ProblemSolution />
			<Features />
			<Pricing />
			<Community />
			<CTA />
			<Footer />
		</main>
	);
}
