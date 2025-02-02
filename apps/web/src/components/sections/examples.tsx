import { FeatureSelector } from "@/components/feature-selector";
import { Section } from "@/components/section";
import { codeToHtml } from "shiki";

interface FeatureOption {
	id: number;
	title: string;
	comingSoon?: boolean;
	description: string;
	code: string;
}

export const featureOptions: FeatureOption[] = [
	{
		id: 1,
		title: "Vision Structured Response",
		comingSoon: false,
		description:
			"Use proxed.ai to send images from your app for seamless, structured analysis",
		code: `import DeviceCheck

actor SimpleAPIIntegrator {
	// API integration configuration
	let projectId = "<your-project-id>"  // Proxed project ID
	let apiKey = "<your-api-key>"        // Partial API key (we don't store the full key)
	let endpoint = "https://api.proxed.ai/v1/vision"  // API endpoint

	func sendImage(image: UIImage) async throws {
		guard let imageData = image.jpegData(compressionQuality: 0.9) else {
			fatalError("Image conversion failed")
		}
		let base64Image = imageData.base64EncodedString()
		let token = await SimpleDeviceCheck.retrieveToken()

		var request = URLRequest(url: URL(string: endpoint)!)
		request.httpMethod = "POST"
		request.setValue(apiKey, forHTTPHeaderField: "proxed-api-key")
		request.setValue(projectId, forHTTPHeaderField: "proxed-project-id")
		if let token = token {
			request.setValue(token, forHTTPHeaderField: "device-check-token")
		}
		request.httpBody = try JSONEncoder().encode(["image": base64Image])

		let (data, response) = try await URLSession.shared.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse,
			  (200...299).contains(httpResponse.statusCode) else {
			fatalError("Failed to send image")
		}

		// Decode structured AI response from received data
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
}`,
	},
];

export async function Examples() {
	const features = await Promise.all(
		featureOptions.map(async (feature) => ({
			...feature,
			code: await codeToHtml(feature.code, {
				lang: "swift",
				theme: "one-dark-pro",
			}),
		})),
	);

	return (
		<Section id="examples">
			<div className="">
				<FeatureSelector features={features} />
			</div>
		</Section>
	);
}
