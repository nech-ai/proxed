import { Section } from "@/components/section";
import { GradientText } from "@/components/gradient-text";
import { generateMetadata } from "@/lib/metadata";
import { ShieldIcon } from "lucide-react";
import Image from "next/image";
import { codeToHtml } from "shiki";

export const metadata = generateMetadata({
	title: "DeviceCheck Authentication",
	description:
		"Ensure only genuine, unmodified iOS devices can access your AI APIs—blocking fake requests and unauthorized users with Apple's DeviceCheck.",
	path: "/device-check",
});

const code = `import DeviceCheck

struct DeviceCheckManager {
    static func generateToken() async throws -> String {
        guard DCDevice.current.isSupported else {
            throw AuthError.deviceCheckNotSupported
        }

        let token = try await DCDevice.current.generateToken()
        return token.base64EncodedString()
    }
}

// Use in your API requests
let token = try await DeviceCheckManager.generateToken()
var request = URLRequest(url: URL(string: "https://api.proxed.ai/v1/chat/completions")!)
request.setValue(token, forHTTPHeaderField: "X-Device-Token")

// Proxed.ai automatically validates the token with Apple's servers
// and ensures the request comes from a legitimate device
let (data, response) = try await URLSession.shared.data(for: request)

// If device check fails, you'll receive a 403 Forbidden response
guard let httpResponse = response as? HTTPURLResponse,
      httpResponse.statusCode == 200 else {
    throw AuthError.invalidDevice
}`;

export default async function Page() {
	const highlightedCode = await codeToHtml(code, {
		lang: "swift",
		theme: "one-dark-pro",
	});

	return (
		<div className="flex flex-col gap-12 py-12">
			<Section id="device-check">
				<div className="border p-8 backdrop-blur">
					<div className="flex items-center gap-4 mb-8">
						<div className="bg-gradient-to-b from-primary to-primary/80 p-3 text-white rounded-lg">
							<ShieldIcon className="h-8 w-8" />
						</div>
						<GradientText as="h1" className="font-medium text-4xl leading-snug">
							DeviceCheck Authentication
						</GradientText>
					</div>

					<div className="relative w-full h-64 mb-12 rounded-lg overflow-hidden">
						<Image
							src="/device-check.png"
							alt="DeviceCheck Authentication Flow"
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
								Hardware-Level Security
							</GradientText>
							<p className="text-gray-400 leading-relaxed">
								proxed.ai integrates Apple's DeviceCheck to ensure only
								legitimate iOS devices can access your AI APIs. This powerful
								authentication system verifies device authenticity at the
								hardware level, blocking emulators, jailbroken devices, and
								automated requests that could compromise your API security.
							</p>
						</section>

						<section>
							<GradientText
								as="h3"
								className="font-medium text-xl mb-4 from-yellow-400 to-yellow-200"
							>
								Zero Configuration Required
							</GradientText>
							<p className="text-gray-400 leading-relaxed">
								Every request through proxed.ai is automatically validated using
								Apple's secure DeviceCheck tokens. These cryptographic tokens
								prove that the request comes from a genuine Apple device,
								providing an additional layer of security beyond traditional API
								authentication methods. We handle all the DeviceCheck setup and
								validation—you just need to include the token in your requests.
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
									<span>Hardware-level device verification</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Block emulators and jailbroken devices</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>Automatic token validation</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary mt-1">•</span>
									<span>No server-side setup needed</span>
								</li>
							</ul>
						</section>
					</div>
				</div>
			</Section>
		</div>
	);
}
