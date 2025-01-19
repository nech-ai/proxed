import { generateMetadata } from "@/lib/metadata";
import Image from "next/image";

export const metadata = generateMetadata({
	title: "About Proxed - Our Mission & Vision",
	description:
		"Learn about Proxed's mission to simplify protecting your AI keys on iOS. Founded by Alex Vakhitov, we're building an open-source platform to help you build your own iOS AI wrapper.",
	path: "/about",
});

export default function Page() {
	return (
		<div className="flex justify-center py-24 md:py-32">
			<div className="max-w-[980px] w-full">
				<div className="border border-gray-800 bg-black/50 p-8 backdrop-blur">
					<h1 className="font-medium text-center text-5xl mb-16 leading-snug bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
						From Energy Tech to AI: <br />A Builder's Journey
					</h1>

					<div className="space-y-12">
						<section>
							<h3 className="font-medium text-xl mb-4 bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
								The Journey
							</h3>
							<p className="text-gray-400 leading-relaxed">
								As a co-founder and CTO of a leading SaaS company in the UK
								energy sector, I've experienced firsthand the transformative
								power of technology. After successfully building and selling our
								company, I gained invaluable insights into creating products
								that truly matter. But throughout this journey, I noticed a
								persistent challenge that kept surfacing.
							</p>
						</section>

						<section>
							<h3 className="font-medium text-xl mb-4 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
								Open Source First
							</h3>
							<p className="text-gray-400 leading-relaxed mb-12">
								I believe that the future of AI tooling should be built in the
								open, with transparency and community at its heart. That's why
								Proxed is open source. We're creating a platform that not only
								solves today's challenges but evolves with the community's
								needs, fostering innovation and collaboration in the rapidly
								advancing world of AI.
							</p>
						</section>

						<section>
							<div className="flex justify-center">
								<Image
									src={"/alex.jpeg"}
									width={450}
									height={290}
									alt="Alex Vakhitov"
									className="rounded-lg border border-gray-800/50"
									priority
								/>
							</div>
						</section>

						<div className="flex items-center pt-6 border-t border-gray-800">
							<div className="space-y-1">
								<p className="text-sm text-gray-400">Best regards,</p>
								<p className="font-medium">Alex Vakhitov</p>
								<p className="text-sm text-gray-400">Founder & CEO, Proxed</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
