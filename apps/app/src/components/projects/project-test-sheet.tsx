"use client";

import { useState, useCallback, type ChangeEvent } from "react";
import {
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@proxed/ui/components/sheet";
import { Button } from "@proxed/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import { Input } from "@proxed/ui/components/input";
import { Textarea } from "@proxed/ui/components/textarea";
import { Label } from "@proxed/ui/components/label";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@proxed/ui/components/alert";
import { ScrollArea } from "@proxed/ui/components/scroll-area";
import { CodeBlock } from "@/components/shared/code-block";
import { Separator } from "@proxed/ui/components/separator";

type Endpoint = "/v1/text" | "/v1/pdf" | "/v1/vision";

interface ProjectTestSheetProps {
	projectId: string;
	testKey: string;
}

interface RequestState {
	loading: boolean;
	request?: {
		url: string;
		method: string;
		headers: Record<string, string>;
		body: string;
	};
	response?: {
		status: number;
		statusText: string;
		body: string;
	};
	error?: string;
}

export function ProjectTestSheet({
	projectId,
	testKey,
}: ProjectTestSheetProps) {
	const { toast } = useToast();
	const [selectedEndpoint, setSelectedEndpoint] =
		useState<Endpoint>("/v1/text");
	const [textInput, setTextInput] = useState("");
	const [fileInput, setFileInput] = useState<File | null>(null);
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [partialApiKeyInput, setPartialApiKeyInput] = useState("");
	const [requestState, setRequestState] = useState<RequestState>({
		loading: false,
	});

	const resetForm = () => {
		setTextInput("");
		setFileInput(null);
		setFilePreview(null);
		setRequestState({ loading: false });
	};

	const handleEndpointChange = (value: string) => {
		setSelectedEndpoint(value as Endpoint);
		resetForm();
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFileInput(file);
			if (selectedEndpoint === "/v1/pdf" || selectedEndpoint === "/v1/vision") {
				const reader = new FileReader();
				reader.onloadend = () => {
					setFilePreview(reader.result as string);
				};
				reader.readAsDataURL(file);
			} else {
				setFilePreview(null);
			}
		} else {
			setFileInput(null);
			setFilePreview(null);
		}
	};

	const readFileAsBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
			reader.readAsDataURL(file);
		});
	};

	const handleSendRequest = useCallback(async () => {
		if (!partialApiKeyInput) {
			toast({
				variant: "destructive",
				title: "Client Key Required",
				description: "Please enter the client part of your API key.",
			});
			return;
		}

		setRequestState({ loading: true });

		const proxyApiBaseUrl =
			process.env.NEXT_PUBLIC_PROXY_API_URL || window.location.origin;
		const url = `${proxyApiBaseUrl}${selectedEndpoint}/${projectId}`;

		const method = "POST";
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"x-proxed-test-key": testKey,
			"x-ai-key": partialApiKeyInput,
		};

		let bodyPayload: Record<string, any> = {};
		let fileBase64 = "";

		try {
			if (selectedEndpoint === "/v1/text") {
				if (!textInput) throw new Error("Text input is required.");
				bodyPayload = { text: textInput };
			} else if (selectedEndpoint === "/v1/pdf") {
				if (!fileInput) throw new Error("PDF file is required.");
				if (fileInput.type !== "application/pdf")
					throw new Error("Invalid file type. Please select a PDF.");
				fileBase64 = await readFileAsBase64(fileInput);
				bodyPayload = { pdf: fileBase64 };
			} else if (selectedEndpoint === "/v1/vision") {
				if (!fileInput) throw new Error("Image file is required.");
				if (!fileInput.type.startsWith("image/"))
					throw new Error("Invalid file type. Please select an image.");
				fileBase64 = await readFileAsBase64(fileInput);
				bodyPayload = { image: fileBase64 };
			}
		} catch (error: any) {
			setRequestState({ loading: false, error: error.message });
			toast({
				variant: "destructive",
				title: "Input Error",
				description: error.message,
			});
			return;
		}

		const body = JSON.stringify(bodyPayload);

		setRequestState((prev) => ({
			...prev,
			request: { url, method, headers, body },
		}));

		try {
			const response = await fetch(url, { method, headers, body });
			const responseBody = await response.text();
			let responseJson: any;
			try {
				responseJson = JSON.parse(responseBody);
			} catch {
				responseJson = responseBody;
			}

			setRequestState({
				loading: false,
				request: { url, method, headers, body },
				response: {
					status: response.status,
					statusText: response.statusText,
					body: JSON.stringify(responseJson, null, 2),
				},
			});

			toast({
				title: `Request ${response.ok ? "Successful" : "Failed"}`,
				description: `Status: ${response.status} ${response.statusText}`,
				variant: response.ok ? "default" : "destructive",
			});
		} catch (error: any) {
			setRequestState({
				loading: false,
				request: { url, method, headers, body },
				error: error.message || "Network error or failed to fetch",
			});
			toast({
				variant: "destructive",
				title: "Request Failed",
				description: error.message || "Network error or failed to fetch",
			});
		}
	}, [
		selectedEndpoint,
		projectId,
		testKey,
		partialApiKeyInput,
		textInput,
		fileInput,
		toast,
	]);

	const renderInputFields = () => {
		switch (selectedEndpoint) {
			case "/v1/text":
				return (
					<div className="space-y-2">
						<Label htmlFor="text-input">Text Input</Label>
						<Textarea
							id="text-input"
							placeholder="Enter text here..."
							value={textInput}
							onChange={(e) => setTextInput(e.target.value)}
							rows={6}
						/>
					</div>
				);
			case "/v1/pdf":
				return (
					<div className="space-y-2">
						<Label htmlFor="pdf-input">PDF File</Label>
						<Input
							id="pdf-input"
							type="file"
							accept="application/pdf"
							onChange={handleFileChange}
						/>
						{filePreview && (
							<p className="text-xs text-muted-foreground truncate">
								Selected: {fileInput?.name}
							</p>
						)}
					</div>
				);
			case "/v1/vision":
				return (
					<div className="space-y-2">
						<Label htmlFor="image-input">Image File</Label>
						<Input
							id="image-input"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
						/>
						{filePreview && (
							// biome-ignore lint/performance/noImgElement: local file preview via object URL
							<img
								src={filePreview}
								alt="Preview"
								className="mt-2 max-h-40 rounded border"
							/>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<SheetContent
			side="right"
			className="sm:max-w-[50vw] w-[50vw] p-0 flex flex-col"
		>
			<SheetHeader className="px-6 pt-6 pb-4 border-b">
				<SheetTitle>Test Project Endpoint</SheetTitle>
				<SheetDescription>
					Send requests to your project endpoints using the test key and client
					API key part.
				</SheetDescription>
			</SheetHeader>
			<div className="flex-grow overflow-hidden">
				<ScrollArea className="h-full px-6 py-4">
					<div className="space-y-6">
						<div className="space-y-4 rounded-md border p-4">
							<h3 className="text-sm font-medium mb-4">Configuration</h3>
							<div className="space-y-2">
								<Label htmlFor="endpoint">Endpoint</Label>
								<Select
									value={selectedEndpoint}
									onValueChange={handleEndpointChange}
								>
									<SelectTrigger id="endpoint">
										<SelectValue placeholder="Select an endpoint" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="/v1/text">/v1/text</SelectItem>
										<SelectItem value="/v1/pdf">/v1/pdf</SelectItem>
										<SelectItem value="/v1/vision">/v1/vision</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="client-key">Client Key</Label>
								<Input
									id="client-key"
									placeholder="Paste client part of API key (pk_client_...)"
									value={partialApiKeyInput}
									onChange={(e) => setPartialApiKeyInput(e.target.value)}
									type="password"
								/>
							</div>

							<div className="space-y-2">{renderInputFields()}</div>
						</div>

						{(requestState.request ||
							requestState.response ||
							requestState.error) && (
							<>
								<Separator className="my-4" />
								<div className="space-y-4">
									<h3 className="text-sm font-medium">Results</h3>
									<h4 className="font-medium text-xs text-muted-foreground">
										Request Details
									</h4>
									{requestState.request && (
										<CodeBlock
											language="json"
											code={JSON.stringify(
												{
													url: requestState.request.url,
													method: requestState.request.method,
													headers: {
														...requestState.request.headers,
														"x-ai-key": "pk_client_********",
													},
													body: requestState.request.body
														? JSON.parse(requestState.request.body)
														: null,
												},
												null,
												2,
											)}
											fileName="Request"
										/>
									)}

									<h4 className="font-medium text-xs text-muted-foreground">
										Response
									</h4>
									{requestState.response && (
										<div>
											<p className="text-xs mb-1">
												Status: {requestState.response.status}{" "}
												{requestState.response.statusText}
											</p>
											<CodeBlock
												language="json"
												code={requestState.response.body}
												fileName="Response Body"
											/>
										</div>
									)}
									{requestState.error && (
										<Alert variant="destructive">
											<AlertTitle>Error</AlertTitle>
											<AlertDescription>{requestState.error}</AlertDescription>
										</Alert>
									)}
								</div>
							</>
						)}
					</div>
				</ScrollArea>
			</div>
			<SheetFooter className="px-6 py-4 border-t">
				<Button
					className="w-full"
					onClick={handleSendRequest}
					disabled={
						requestState.loading ||
						!partialApiKeyInput ||
						(selectedEndpoint === "/v1/text" && !textInput) ||
						(selectedEndpoint !== "/v1/text" && !fileInput)
					}
				>
					{requestState.loading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Send className="mr-2 h-4 w-4" />
					)}
					Send Request
				</Button>
			</SheetFooter>
		</SheetContent>
	);
}
