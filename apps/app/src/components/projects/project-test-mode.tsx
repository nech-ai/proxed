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
import { CopyIcon } from "lucide-react";
import type { Tables } from "@proxed/supabase/types";

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

	const handleCopyKey = () => {
		navigator.clipboard.writeText(project.id);
		toast({
			title: "Copied!",
			description: "Project key has been copied to clipboard.",
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Test Mode</CardTitle>
				<CardDescription>
					Test your app without Apple DeviceCheck validation by using a test key
					header
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<h4 className="text-sm font-medium">Test Mode</h4>
						<p className="text-sm text-muted-foreground">
							When enabled, requests with header{" "}
							<code className="text-xs">x-proxed-test-key</code> will bypass
							DeviceCheck validation
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
					<div className="space-y-2">
						<h4 className="text-sm font-medium">Test Key</h4>
						<p className="text-sm text-muted-foreground mb-2">
							Add this key in the{" "}
							<code className="text-xs">x-proxed-test-key</code> header to
							bypass DeviceCheck
						</p>
						<div className="flex items-center gap-2">
							<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
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
								className="h-8 w-8"
							>
								<CopyIcon className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
