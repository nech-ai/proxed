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
		code: `import Foundation
import DeviceCheck

// Example: Making a request to your Proxed.ai endpoint
func fetchChatResponse(prompt: String, completion: @escaping (String?) -> Void) {
    guard let url = URL(string: "https://api.proxed.ai/v1/chat") else {
        completion(nil)
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    // Add your partial key or token as a header
    request.setValue("Bearer YOUR_PARTIAL_KEY", forHTTPHeaderField: "Authorization")

    // JSON body with the user prompt
    let body: [String: Any] = ["prompt": prompt]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])

    URLSession.shared.dataTask(with: request) { data, response, error in
        guard
            let data = data,
            error == nil,
            let result = String(data: data, encoding: .utf8)
        else {
            completion(nil)
            return
        }
        completion(result)
    }.resume()
}

// Usage:
fetchChatResponse(prompt: "Hello AI!") { responseText in
    if let text = responseText {
        print("Response from Proxed.ai: \\(text)")
    } else {
        print("Failed to fetch response.")
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
			<div className="border-x border-t">
				<FeatureSelector features={features} />
			</div>
		</Section>
	);
}
