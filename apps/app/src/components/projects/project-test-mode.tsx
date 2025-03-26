"use client";

import { toggleProjectTestAction } from "@/actions/toggle-project-test-action";
import { Button } from "@proxed/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import { Switch } from "@proxed/ui/components/switch";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { useAction } from "next-safe-action/hooks";
import {
	CopyIcon,
	BookOpen,
	ExternalLink,
	Info,
	AlertCircle,
	HelpCircle,
} from "lucide-react";
import type { Tables } from "@proxed/supabase/types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@proxed/ui/components/accordion";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";

interface ProjectTestModeProps {
	project: Tables<"projects">;
}

export function ProjectTestMode({ project }: ProjectTestModeProps) {
	const { toast } = useToast();

	const toggleTestMode = useAction(toggleProjectTestAction, {
		onSuccess: () => {
			toast({
				title: "Test mode updated",
				description: "The project test mode has been updated successfully.",
			});
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: error?.error?.serverError || "Failed to update test mode",
			});
		},
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Test Mode</CardTitle>
						<CardDescription>
							Test your app without Apple DeviceCheck validation by using a test
							key header.
						</CardDescription>
					</div>
					<a
						href="https://docs.proxed.ai/projects/test-mode"
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
					>
						<BookOpen className="h-3.5 w-3.5" />
						<span>Documentation</span>
						<ExternalLink className="h-3 w-3" />
					</a>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<Accordion type="single" collapsible className="mb-4">
					<AccordionItem
						value="about"
						className="border rounded-md overflow-hidden"
					>
						<AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
							<div className="flex items-center gap-2">
								<Info className="h-4 w-4 text-blue-500" />
								<span>What is Test Mode?</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="px-3 pb-3">
							<p className="text-sm text-muted-foreground mb-2">
								Test Mode allows you to bypass Apple DeviceCheck validation
								during development and testing.
							</p>
							<p className="text-sm text-muted-foreground mb-2">
								When enabled, you can use a test key in the{" "}
								<code className="text-xs bg-muted px-1 py-0.5 rounded">
									x-proxed-test-key
								</code>{" "}
								header to authenticate requests without implementing DeviceCheck
								in your app.
							</p>
							<p className="text-sm font-medium mt-2">Benefits:</p>
							<ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
								<li>Simplified development and testing workflow</li>
								<li>No need for DeviceCheck implementation in test builds</li>
								<li>Easily toggle between test and production modes</li>
								<li>Test key is regenerated each time for security</li>
							</ul>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<div className="flex items-center gap-2">
							<h4 className="text-sm font-medium">Test Mode</h4>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-[220px]">
										When enabled, requests with the test key will bypass
										DeviceCheck validation
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<p className="text-sm text-muted-foreground">
							When enabled, requests with header{" "}
							<code className="text-xs bg-muted px-1 py-0.5 rounded">
								x-proxed-test-key
							</code>{" "}
							will bypass DeviceCheck validation
						</p>
					</div>
					<Switch
						checked={project.test_mode || false}
						onCheckedChange={(checked) =>
							toggleTestMode.execute({
								projectId: project.id,
								testMode: checked,
							})
						}
					/>
				</div>

				{project.test_mode && project.test_key && (
					<>
						<Alert className="border-yellow-500/20 bg-yellow-500/10 dark:border-yellow-500/30 dark:bg-yellow-500/20">
							<AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
							<div className="ml-2">
								<div className="font-medium text-foreground">
									🔑 Test Mode Enabled
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									⚠️ This project is in test mode. Do not use in production
									environments.
								</p>
							</div>
						</Alert>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<h4 className="text-sm font-medium">Test Key</h4>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
										</TooltipTrigger>
										<TooltipContent side="right" className="max-w-[240px]">
											Include this key in the x-proxed-test-key header to bypass
											DeviceCheck in test environments
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<p className="text-sm text-muted-foreground mb-2">
								Add this key in the{" "}
								<code className="text-xs bg-muted px-1 py-0.5 rounded">
									x-proxed-test-key
								</code>{" "}
								header to bypass DeviceCheck
							</p>
							<div className="flex items-center gap-2">
								<code className="relative rounded bg-muted px-[0.5rem] py-[0.4rem] font-mono text-sm flex-1 overflow-x-auto">
									{project.test_key}
								</code>
								<Button
									variant="outline"
									size="icon"
									onClick={() => {
										navigator.clipboard.writeText(project.test_key || "");
										toast({
											title: "Copied!",
											description: "Test key has been copied to clipboard.",
										});
									}}
									className="h-9 w-9"
								>
									<CopyIcon className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<Accordion type="single" collapsible className="w-full mt-2">
							<AccordionItem
								value="implementation"
								className="border rounded-md"
							>
								<AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
									<div className="flex items-center gap-2">
										<Info className="h-3.5 w-3.5 text-blue-500" />
										<span>How to use this test key in your app</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-3 pb-3 text-xs">
									<p className="text-muted-foreground mb-2">
										Include the test key in your API requests to Proxed.AI:
									</p>
									<div className="bg-muted p-2 rounded-md font-mono text-xs mb-2 overflow-x-auto">
										var request = URLRequest(url: URL(string: endpoint)!)
										<br />
										request.setValue("{project.test_key}", forHTTPHeaderField:
										"x-proxed-test-key")
									</div>
									<p className="text-muted-foreground mb-1 font-medium">
										Security Best Practices:
									</p>
									<ul className="text-muted-foreground list-disc pl-4 space-y-0.5">
										<li>Only use Test Mode during development and testing</li>
										<li>Disable Test Mode before deploying to production</li>
										<li>
											Store test keys securely in your development environments
										</li>
										<li>
											Regularly audit your projects to ensure Test Mode is
											disabled
										</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</>
				)}
			</CardContent>
		</Card>
	);
}
