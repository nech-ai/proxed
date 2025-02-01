"use client";

import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@proxed/ui/components/card";
import type { Tables } from "@proxed/supabase/types";
import { CodeView } from "@/components/schema-builder/code-view";
import { ExecutionMetrics } from "@/components/executions/execution-metrics";

type Execution = Tables<"executions"> & {
	project: Tables<"projects">;
	device_check: Tables<"device_checks">;
	key: Tables<"provider_keys">;
};

interface ExecutionDetailsCardProps {
	execution: Execution;
}

export function ExecutionDetailsCard({ execution }: ExecutionDetailsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Execution #{execution.id}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* General Information */}
					<div>
						<h3 className="text-lg font-semibold border-b pb-2 text-foreground">
							General Information
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
							<div>
								<p className="text-sm text-muted-foreground">Project</p>
								<p className="text-base">
									{execution.project
										? execution.project.name
										: execution.project_id}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Device Check</p>
								<p className="text-base">
									{execution.device_check
										? execution.device_check.name
										: execution.device_check_id}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Provider Key</p>
								<p className="text-base">
									{execution.key
										? execution.key.display_name
										: execution.key_id}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">IP Address</p>
								<p className="text-base">{execution.ip}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">User Agent</p>
								<p className="text-base">{execution.user_agent || "N/A"}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Model</p>
								<p className="text-base">{execution.model}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Provider</p>
								<p className="text-base">{execution.provider}</p>
							</div>
						</div>
					</div>

					{/* Metrics */}
					<div>
						<h3 className="text-lg font-semibold border-b pb-2 text-foreground">
							Metrics
						</h3>
						<div className="mt-4">
							<ExecutionMetrics
								promptTokens={execution.prompt_tokens}
								completionTokens={execution.completion_tokens}
								totalTokens={execution.total_tokens}
								promptCost={execution.prompt_cost}
								completionCost={execution.completion_cost}
								totalCost={execution.total_cost}
							/>
						</div>
					</div>

					{/* Additional Details */}
					<div>
						<h3 className="text-lg font-semibold border-b pb-2 text-foreground">
							Additional Details
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
							<div>
								<p className="text-sm text-muted-foreground">Finish Reason</p>
								<p className="text-base">{execution.finish_reason}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Latency (ms)</p>
								<p className="text-base">{execution.latency}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Response Code</p>
								<p className="text-base">{execution.response_code}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Created At</p>
								<p className="text-base">
									{new Date(execution.created_at).toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Updated At</p>
								<p className="text-base">
									{new Date(execution.updated_at).toLocaleString()}
								</p>
							</div>
						</div>
					</div>

					{execution.prompt && (
						<div className="mt-6">
							<p className="text-sm text-muted-foreground">Prompt</p>
							<p className="text-base whitespace-pre-wrap">
								{execution.prompt}
							</p>
						</div>
					)}
					{execution.response && (
						<div className="mt-6">
							<p className="text-sm text-muted-foreground">Response</p>
							<CodeView code={execution.response} language="json" />
						</div>
					)}
					{execution.error_message && (
						<div className="mt-6">
							<p className="text-sm text-muted-foreground text-destructive">
								Error Message
							</p>
							<p className="text-base whitespace-pre-wrap text-destructive">
								{execution.error_message}
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
