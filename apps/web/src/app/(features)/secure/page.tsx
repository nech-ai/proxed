import { Section } from "@/components/section";
import { GradientText } from "@/components/gradient-text";
import { generateMetadata } from "@/lib/metadata";
import { KeyIcon } from "lucide-react";
import Image from "next/image";
import { codeToHtml } from "shiki";

export const metadata = generateMetadata({
	title: "Secure Your AI API",
	description:
		"Proxed.AI acts as a secure proxy—just update your API URL and instantly protect your AI calls. Founded by Alex Vakhitov, we're building an open-source platform for secure AI integration.",
	path: "/secure",
});

const code = `import DeviceCheck

actor SimpleAPIIntegrator {
	let apiKey = "<your-api-key>"        // Partial API key (we don't store the full key)
	let endpoint = "https://api.proxed.ai/v1/vision/<your-project-id>"  // API endpoint

	func sendImage(image: UIImage) async throws {
		guard let imageData = image.jpegData(compressionQuality: 0.9) else {
			fatalError("Image conversion failed")
		}
		let base64Image = imageData.base64EncodedString()
		let token = await SimpleDeviceCheck.retrieveToken()

		var request = URLRequest(url: URL(string: endpoint)!)
		request.httpMethod = "POST"
		request.setValue(apiKey, forHTTPHeaderField: "x-ai-key")
		if let token = token {
			request.setValue(token, forHTTPHeaderField: "x-device-token")
		}
		request.httpBody = try JSONEncoder().encode(["image": base64Image])

		let (data, response) = try await URLSession.shared.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse,
			  (200...299).contains(httpResponse.statusCode) else {
			fatalError("Failed to send image")
		}

		// Decode structured AI response which you build in the project settings from received data
		let plantResponse = try JSONDecoder().decode(PlantResponse.self, from: data)
		print("Plant Response:", plantResponse)
	}
}

struct SimpleDeviceCheck {
	static func retrieveToken() async -> String? {
		guard DCDevice.current.isSupported else {
			print("DeviceCheck not supported")
			return nil
		}
		do {
			let tokenData = try await DCDevice.current.generateToken()
			return tokenData.base64EncodedString()
		} catch {
			print("Error generating token:", error)
			return nil
		}
	}
}

struct PlantResponse: Decodable {
	let scientificName: String
	let commonNames: [String]
}`;

export default async function Page() {
	const highlightedCode = await codeToHtml(code, {
		lang: "swift",
		theme: "one-dark-pro",
	});

	return (
		<div className="flex flex-col gap-12 py-12">
			<Section id="secure">
				<div className="border p-8 backdrop-blur">
					<div className="flex items-center gap-4 mb-8">
						<div className="bg-gradient-to-b from-primary to-primary/80 p-3 text-white rounded-lg">
							<KeyIcon className="h-8 w-8" />
						</div>
						<GradientText as="h1" className="font-medium text-4xl leading-snug">
							Secure Your AI API with One URL Change
						</GradientText>
					</div>

					<div className="relative w-full h-64 mb-12 rounded-lg overflow-hidden">
						<Image
							src="/executions.png"
							alt="API Executions Dashboard"
							fill
							className="object-cover"
							priority
						/>
					</div>

					<div className="space-y-12">
						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-purple-400 to-purple-200"
							>
								Simple Yet Powerful
							</GradientText>
							<p className="text-gray-400 leading-relaxed">
								Proxed.AI makes securing your AI integration as simple as
								changing a URL. No complex setup, no infrastructure changes—just
								point your API calls to our secure proxy and instantly gain
								enterprise-grade protection for your AI services. We handle
								device verification, API key management, and response validation
								while you focus on building great features.
							</p>
						</section>

						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-yellow-400 to-yellow-200"
							>
								Open Source Security
							</GradientText>
							<p className="text-gray-400 leading-relaxed">
								Security should be transparent. That's why Proxed.AI is open
								source, letting you verify our protection mechanisms and
								contribute to making AI integration safer for everyone. Our
								proxy service combines DeviceCheck verification, secure API key
								management, and structured response handling—all through a
								single URL change.
							</p>
						</section>

						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-blue-400 to-blue-200"
							>
								Implementation Example
							</GradientText>
							<div
								className="bg-secondary/20 rounded-lg overflow-hidden"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
								dangerouslySetInnerHTML={{ __html: highlightedCode }}
							/>
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
									<span>Zero API keys in your client code</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Automatic DeviceCheck verification</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Real-time request monitoring and analytics</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Rate limiting and cost control built-in</span>
								</li>
							</ul>
						</section>
					</div>
				</div>
			</Section>
		</div>
	);
}
