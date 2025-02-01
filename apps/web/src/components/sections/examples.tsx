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
		code: `import UIKit
import DeviceCheck

/// Handles DeviceCheck token retrieval
struct ProxedDeviceCheck {
    static func getToken() async -> String? {
        // Check if DeviceCheck is supported
        guard DCDevice.current.isSupported else {
            print("Proxed warning: DeviceCheck is not available on this device.")
            return nil
        }
        // Attempt to generate a token
        do {
            let data = try await DCDevice.current.generateToken()
            return data.base64EncodedString()
        } catch {
            print("Failed to generate DeviceCheck token: \(error)")
            return nil
        }
    }
}

/// Represents the AI response shape (simplified example)
struct PlantResponse: Decodable {
    let isValid: Bool
    let scientificName: String
    let commonNames: [String]
}

/// Sends an image to a Proxed.ai endpoint for structured analysis
actor PlantClassifier {
    let projectId = "<your-project-id>"
    let apiKey = "<your-api-key>"
    let endpoint = "https://api.proxed.ai/v1/vision"

    func identify(image: UIImage) async throws -> PlantResponse {
        // Convert image to Base64
        guard let imageData = image.jpegData(compressionQuality: 0.9) else {
            fatalError("Unable to convert image to JPEG data")
        }
        let base64Image = imageData.base64EncodedString()

        // Optionally retrieve DeviceCheck token
        let deviceCheckToken = await ProxedDeviceCheck.getToken()

        // Prepare request
        var request = URLRequest(url: URL(string: endpoint)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "proxed-api-key")
        request.setValue(projectId, forHTTPHeaderField: "proxed-project-id")

        // If DeviceCheck is available, attach token header
        if let token = deviceCheckToken {
            request.setValue(token, forHTTPHeaderField: "proxed-device-token")
        }

        // Send Base64-encoded image as JSON
        let payload = ["image": base64Image]
        request.httpBody = try JSONEncoder().encode(payload)

        // Execute call
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            fatalError("Failed to get a valid AI response")
        }

        // Decode and return the structured response
        return try JSONDecoder().decode(PlantResponse.self, from: data)
    }
}
`,
	},
];

export async function Examples() {
	const features = await Promise.all(
		featureOptions.map(async (feature) => ({
			...feature,
			code: await codeToHtml(feature.code, {
				lang: "swift",
				theme: "github-dark",
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
