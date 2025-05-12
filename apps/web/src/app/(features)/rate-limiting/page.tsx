import { Section } from "@/components/section";
import { GradientText } from "@/components/gradient-text";
import { generateMetadata } from "@/lib/metadata";
import { GaugeIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

export const metadata = generateMetadata({
	title: "Rate Limiting & Cost Control - Coming Soon",
	description:
		"Coming Soon: Monitor API usage, set request limits, and prevent runaway costs automatically with Proxed.AI's comprehensive rate limiting system.",
	path: "/rate-limiting",
});

export default function Page() {
	return (
		<div className="flex flex-col gap-12 py-12">
			<Section id="rate-limiting">
				<div className="border p-8 backdrop-blur">
					<div className="flex items-center gap-4 mb-8">
						<div className="bg-gradient-to-b from-primary to-primary/80 p-3 text-white rounded-lg">
							<GaugeIcon className="h-8 w-8" />
						</div>
						<GradientText as="h1" className="font-medium text-4xl leading-snug">
							Rate Limiting & AI Cost Control
						</GradientText>
					</div>

					<div className="space-y-12">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className=" p-6 mb-8">
								<ClockIcon className="h-16 w-16 text-primary mb-4 mx-auto" />
								<h2 className="text-2xl font-medium mb-4">Coming Soon</h2>
								<p className="text-gray-400 max-w-lg mx-auto mb-8">
									We're working hard to bring you powerful rate limiting and
									cost control features. Stay tuned for updates!
								</p>
								<Link
									href="/#features"
									className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
								>
									<span className="border-b border-transparent transition-colors hover:border-current">
										Explore other features
									</span>
									<svg
										className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 7l5 5m0 0l-5 5m5-5H6"
										/>
									</svg>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</Section>
		</div>
	);
}
