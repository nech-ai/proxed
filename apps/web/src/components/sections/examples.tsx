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
		title: "Vision Analysis",
		comingSoon: false,
		description:
			"Transform images into structured data with our Vision API. Perfect for building apps that need to understand and analyze visual content - from product recognition to medical imaging analysis.",
		code: `import DeviceCheck

actor VisionAnalyzer {
	let apiKey = "<your-api-key>"
	let endpoint = "https://api.proxed.ai/v1/vision/<your-project-id>"

	func analyzeImage(image: UIImage) async throws {
		guard let imageData = image.jpegData(compressionQuality: 0.9) else {
			throw AnalyzerError.imageConversionFailed
		}
		let base64Image = imageData.base64EncodedString()
		let token = await DeviceCheck.retrieveToken()

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
			throw AnalyzerError.requestFailed
		}

		let analysis = try JSONDecoder().decode(VisionAnalysis.self, from: data)
		print("Vision Analysis:", analysis)
	}
}`,
	},
	{
		id: 2,
		title: "Text Analysis",
		comingSoon: false,
		description:
			"Convert unstructured text into actionable data. Extract entities, analyze sentiment, classify content, and more with our advanced NLP capabilities.",
		code: `import DeviceCheck

actor TextAnalyzer {
	let apiKey = "<your-api-key>"
	let endpoint = "https://api.proxed.ai/v1/text/<your-project-id>"

	func analyzeText(_ text: String) async throws {
		let token = await DeviceCheck.retrieveToken()

		var request = URLRequest(url: URL(string: endpoint)!)
		request.httpMethod = "POST"
		request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		request.setValue(apiKey, forHTTPHeaderField: "x-ai-key")
		if let token = token {
			request.setValue(token, forHTTPHeaderField: "x-device-token")
		}
		request.httpBody = try JSONEncoder().encode(["text": text])

		let (data, response) = try await URLSession.shared.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse,
			  (200...299).contains(httpResponse.statusCode) else {
			throw AnalyzerError.requestFailed
		}

		let analysis = try JSONDecoder().decode(TextAnalysis.self, from: data)
		print("Text Analysis:", analysis)
	}
}`,
	},
	{
		id: 3,
		title: "Document Analysis",
		comingSoon: false,
		description:
			"Extract structured data from PDFs and documents automatically. Perfect for automating document processing workflows, from invoice parsing to research paper analysis.",
		code: `import DeviceCheck

actor DocumentAnalyzer {
	let apiKey = "<your-api-key>"
	let endpoint = "https://api.proxed.ai/v1/document/<your-project-id>"

	func analyzeDocumentData(_ documentData: Data) async throws {
		let token = await DeviceCheck.retrieveToken()
		let base64Document = documentData.base64EncodedString()

		var request = URLRequest(url: URL(string: endpoint)!)
		request.httpMethod = "POST"
		request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		request.setValue(apiKey, forHTTPHeaderField: "x-ai-key")
		if let token = token {
			request.setValue(token, forHTTPHeaderField: "x-device-token")
		}
		request.httpBody = try JSONEncoder().encode(["pdf": base64Document])

		let (data, response) = try await URLSession.shared.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse,
			  (200...299).contains(httpResponse.statusCode) else {
			throw AnalyzerError.requestFailed
		}

		let analysis = try JSONDecoder().decode(DocumentAnalysis.self, from: data)
		print("Document Analysis:", analysis)
	}
}`,
	},
	{
		id: 4,
		title: "OpenAI Proxy",
		comingSoon: false,
		description:
			"Secure and monitor your OpenAI API usage with our enterprise-grade proxy. Includes rate limiting, usage tracking, and seamless integration with existing OpenAI SDKs.",
		code: `import OpenAI

actor OpenAIAnalyzer {
    let endpoint = "https://api.proxed.ai/v1/openai/<your-project-id>"
    let apiKey = "<your-api-key>"
    let client: OpenAI

    init() async {
        let token = await DeviceCheck.retrieveToken()
        let combinedToken = "\(apiKey).\(token ?? "")"

        let configuration = OpenAI.Configuration(
            baseURL: URL(string: endpoint)!,
            apiKey: combinedToken
        )

        client = OpenAI(configuration: configuration)
    }

    func generateCompletion(messages: [Chat]) async throws -> ChatCompletion {
        let query = ChatQuery(
            model: .gpt4,
            messages: messages
        )
        return try await client.chats(query: query)
    }
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
