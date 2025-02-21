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
}`,
	},
	{
		id: 2,
		title: "Text Structured Response",
		comingSoon: false,
		description:
			"Send text to proxed.ai for structured analysis and get consistent, schema-validated responses",
		code: `import DeviceCheck

actor TextAnalyzer {
	let apiKey = "<your-api-key>"        // Partial API key (we don't store the full key)
	let endpoint = "https://api.proxed.ai/v1/text/<your-project-id>"  // API endpoint

	func analyzeText(_ text: String) async throws {
		let token = await SimpleDeviceCheck.retrieveToken()

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
			fatalError("Failed to analyze text")
		}

		// Decode structured AI response based on your project schema
		let analysis = try JSONDecoder().decode(TextAnalysis.self, from: data)
		print("Text Analysis:", analysis)
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

struct TextAnalysis: Decodable {
	let sentiment: String
	let topics: [String]
	let summary: String
	let keyPhrases: [String]
}`,
	},
	{
		id: 3,
		title: "PDF Structured Response",
		comingSoon: false,
		description:
			"Extract structured information from PDFs with our advanced document analysis API",
		code: `import DeviceCheck

actor PDFAnalyzer {
	let apiKey = "<your-api-key>"        // Partial API key (we don't store the full key)
	let endpoint = "https://api.proxed.ai/v1/pdf/<your-project-id>"  // API endpoint

	func analyzePDF(pdfURL: URL) async throws {
		let token = await SimpleDeviceCheck.retrieveToken()

		var request = URLRequest(url: URL(string: endpoint)!)
		request.httpMethod = "POST"
		request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		request.setValue(apiKey, forHTTPHeaderField: "x-ai-key")
		if let token = token {
			request.setValue(token, forHTTPHeaderField: "x-device-token")
		}
		request.httpBody = try JSONEncoder().encode(["pdf": pdfURL.absoluteString])

		let (data, response) = try await URLSession.shared.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse,
			  (200...299).contains(httpResponse.statusCode) else {
			fatalError("Failed to analyze PDF")
		}

		// Decode structured AI response based on your project schema
		let analysis = try JSONDecoder().decode(PDFAnalysis.self, from: data)
		print("PDF Analysis:", analysis)
	}

	func analyzePDFData(_ pdfData: Data) async throws {
		let token = await SimpleDeviceCheck.retrieveToken()
		let base64PDF = "data:application/pdf;base64," + pdfData.base64EncodedString()

		var request = URLRequest(url: URL(string: endpoint)!)
		request.httpMethod = "POST"
		request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		request.setValue(apiKey, forHTTPHeaderField: "x-ai-key")
		if let token = token {
			request.setValue(token, forHTTPHeaderField: "x-device-token")
		}
		request.httpBody = try JSONEncoder().encode(["pdf": base64PDF])

		let (data, response) = try await URLSession.shared.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse,
			  (200...299).contains(httpResponse.statusCode) else {
			fatalError("Failed to analyze PDF")
		}

		// Decode structured AI response based on your project schema
		let analysis = try JSONDecoder().decode(PDFAnalysis.self, from: data)
		print("PDF Analysis:", analysis)
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

struct PDFAnalysis: Decodable {
	let title: String
	let authors: [String]
	let summary: String
	let keyFindings: [String]
	let tables: [Table]
	let figures: [Figure]
}

struct Table: Decodable {
	let caption: String
	let data: [[String]]
}

struct Figure: Decodable {
	let caption: String
	let description: String
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
