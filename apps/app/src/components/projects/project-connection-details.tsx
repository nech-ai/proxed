"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import { Button } from "@proxed/ui/components/button";
import { Input } from "@proxed/ui/components/input";
import { useToast } from "@proxed/ui/hooks/use-toast";
import type { Tables } from "@proxed/supabase/types";
import { CopyIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ProjectConnectionDetailsProps {
	project: Tables<"projects">;
}

// Define endpoint paths
const endpointPaths = ["/v1/text", "/v1/pdf", "/v1/vision", "/v1/openai"];

export function ProjectConnectionDetails({
	project,
}: ProjectConnectionDetailsProps) {
	const { toast } = useToast();
	const [selectedEndpointPath, setSelectedEndpointPath] = useState<string>(
		endpointPaths[0],
	);

	const proxyApiBaseUrl =
		process.env.NEXT_PUBLIC_PROXY_API_URL || "https://api.proxed.ai";

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: "Copied!",
			description: `${label} copied to clipboard.`,
		});
	};

	const fullEndpointUrl = `${proxyApiBaseUrl}${selectedEndpointPath}/${project.id}`;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>API Connection Details</CardTitle>
						<CardDescription>
							Use these details to connect your application to the Proxed API.
						</CardDescription>
					</div>
					<Button variant="link" asChild className="text-xs">
						<Link
							href="/docs/authentication"
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="h-3 w-3 mr-1" />
							Auth Docs
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<label
						htmlFor="project-id"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Project ID
					</label>
					<div className="flex items-center gap-2">
						<Input id="project-id" value={project.id} readOnly />
						<Button
							variant="outline"
							size="icon"
							onClick={() => copyToClipboard(project.id, "Project ID")}
						>
							<CopyIcon className="h-4 w-4" />
						</Button>
					</div>
					<p className="text-[0.8rem] text-muted-foreground">
						Your unique project identifier.
					</p>
				</div>

				<div className="space-y-2">
					<h3 className="text-sm font-medium leading-none">API Endpoint URL</h3>
					<div className="flex items-center gap-1 border rounded-md p-2 bg-muted overflow-x-auto">
						<span className="text-sm font-mono whitespace-nowrap">
							{proxyApiBaseUrl}
						</span>
						<Select
							value={selectedEndpointPath}
							onValueChange={setSelectedEndpointPath}
						>
							<SelectTrigger
								id="endpoint-path-select"
								className="h-8 text-xs font-mono flex-shrink-0 w-auto min-w-[150px] max-w-[300px] border-none shadow-none bg-background data-[placeholder]:text-muted-foreground"
							>
								<SelectValue placeholder="Select path" />
							</SelectTrigger>
							<SelectContent>
								{endpointPaths.map((path) => (
									<SelectItem key={path} value={path} className="text-xs">
										{path}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span className="text-sm font-mono whitespace-nowrap">
							/{project.id}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="ml-auto h-7 w-7 flex-shrink-0"
							onClick={() =>
								copyToClipboard(fullEndpointUrl, "API Endpoint URL")
							}
						>
							<CopyIcon className="h-4 w-4" />
						</Button>
					</div>
					<p className="text-[0.8rem] text-muted-foreground">
						Select the endpoint path to construct the full URL. Use the button
						to copy the complete URL.
					</p>
				</div>

				<div className="space-y-2 mt-4 pt-4 border-t">
					<p className="text-[0.8rem] text-muted-foreground">
						Remember to include the necessary authentication headers as
						described in the{" "}
						<Button variant="link" asChild className="p-0 h-auto text-xs">
							<Link href="/docs/authentication" target="_blank">
								authentication documentation
							</Link>
						</Button>
						.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
