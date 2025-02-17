import { Section } from "@/components/section";
import { GradientText } from "@/components/gradient-text";
import { generateMetadata } from "@/lib/metadata";
import { BrainIcon } from "lucide-react";
import Image from "next/image";

export const metadata = generateMetadata({
	title: "Structured AI Responses",
	description:
		"Define response formats and enforce consistency with our visual schema builder. Get type-safe, validated AI responses every time.",
	path: "/structured-responses",
});

export default function Page() {
	return (
		<div className="flex flex-col gap-12 py-12">
			<Section id="structured-responses">
				<div className="border p-8 backdrop-blur">
					<div className="flex items-center gap-4 mb-8">
						<div className="bg-gradient-to-b from-primary to-primary/80 p-3 text-white rounded-lg">
							<BrainIcon className="h-8 w-8" />
						</div>
						<GradientText as="h1" className="font-medium text-4xl leading-snug">
							Structured AI Responses
						</GradientText>
					</div>

					<div className="relative w-full h-[400px] mb-12 rounded-lg overflow-hidden">
						<Image
							src="/schema-builder.png"
							alt="Visual Schema Builder Interface"
							fill
							className="object-contain"
							priority
						/>
					</div>

					<div className="space-y-12">
						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-purple-400 to-purple-200"
							>
								Visual Schema Builder
							</GradientText>
							<p className="text-gray-400 leading-relaxed">
								Design your AI response structure visually with our intuitive
								schema builder. Define objects, arrays, enums, and required
								fields through a user-friendly interface. No more hand-writing
								JSON Schema—just drag, drop, and configure your desired response
								format.
							</p>
						</section>

						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-yellow-400 to-yellow-200"
							>
								Automatic Validation
							</GradientText>
							<p className="text-gray-400 leading-relaxed">
								Every AI response is automatically validated against your schema
								before being returned to your app. Our system ensures that
								responses match your defined structure exactly, with proper
								types, required fields, and enum values. Invalid responses are
								caught and regenerated, so your app always receives clean,
								structured data.
							</p>
						</section>

						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-blue-400 to-blue-200"
							>
								How It Works
							</GradientText>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1">
										1
									</div>
									<div>
										<h4 className="text-lg font-medium mb-2">
											Design Your Schema
										</h4>
										<p className="text-gray-400">
											Use our visual builder to create your response structure.
											Add fields, specify types, and set validation rules with
											simple drag-and-drop actions.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1">
										2
									</div>
									<div>
										<h4 className="text-lg font-medium mb-2">
											Test in Real-Time
										</h4>
										<p className="text-gray-400">
											Preview sample responses and validate your schema
											instantly. Our builder shows you exactly how your AI
											responses will be structured.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1">
										3
									</div>
									<div>
										<h4 className="text-lg font-medium mb-2">
											Deploy with Confidence
										</h4>
										<p className="text-gray-400">
											Once satisfied, deploy your schema. All AI responses will
											be automatically validated and formatted according to your
											specifications.
										</p>
									</div>
								</div>
							</div>
						</section>

						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-green-400 to-green-200"
							>
								Key Benefits
							</GradientText>
							<ul className="space-y-4 text-gray-400">
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Visual schema design with drag-and-drop</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Automatic response validation and type safety</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Support for nested objects and arrays</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Real-time schema validation and testing</span>
								</li>
							</ul>
						</section>
					</div>
				</div>
			</Section>
		</div>
	);
}
