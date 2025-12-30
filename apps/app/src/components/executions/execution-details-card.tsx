"use client";

import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@proxed/ui/components/card";
import { CodeView } from "@/components/schema-builder/code-view";
import { ExecutionMetrics } from "@/components/executions/execution-metrics";
import { getLocationInfo } from "@proxed/location/client";
import { useUserContext } from "@/store/user/hook";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { UTCDate } from "@date-fns/utc";
import { format } from "date-fns";
import { useMemo } from "react";

interface ExecutionDetailsCardProps {
	executionId: string;
}

export function ExecutionDetailsCard({
	executionId,
}: ExecutionDetailsCardProps) {
	const trpc = useTRPC();
	const { data: execution } = useQuery(
		trpc.executions.byId.queryOptions({ id: executionId }),
	);
	const { dateFormat } = useUserContext((state) => state.data);
	const dateTimeFormat = dateFormat || "yyyy-MM-dd HH:mm:ss";

	if (!execution) {
		return null;
	}

	const responsePayload = useMemo(() => {
		if (!execution.response) return null;
		try {
			return JSON.parse(execution.response);
		} catch {
			return null;
		}
	}, [execution.response]);

	const vaultItems = Array.isArray(responsePayload?.vault?.items)
		? responsePayload?.vault?.items
		: [];

	const vaultPaths = vaultItems
		.map((item: { path?: string }) => item?.path)
		.filter((path: string | undefined): path is string => Boolean(path));

	const signedUrlsQuery = useQuery({
		...trpc.vault.signedUrls.queryOptions(
			{ paths: vaultPaths, expiresIn: 600 },
		),
		enabled: vaultPaths.length > 0,
	});

	const signedUrlsByPath = new Map(
		(signedUrlsQuery.data ?? [])
			.filter((item) => item.url)
			.map((item) => [item.path, item.url]),
	);

	const locationInfo = getLocationInfo(
		execution.countryCode,
		execution.regionCode,
	);
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
										: execution.projectId}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Device Check</p>
								<p className="text-base">
									{execution.deviceCheck
										? execution.deviceCheck.name
										: execution.deviceCheckId}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Provider Key</p>
								<p className="text-base">
									{execution.key ? execution.key.displayName : execution.keyId}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">IP Address</p>
								<p className="text-base">{execution.ip}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Location</p>
								<p className="text-base">
									{locationInfo.flag} {locationInfo.country},{" "}
									{locationInfo.region}, {execution.city || "Unknown"}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">User Agent</p>
								<p className="text-base">{execution.userAgent || "N/A"}</p>
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
								promptTokens={execution.promptTokens}
								completionTokens={execution.completionTokens}
								totalTokens={execution.totalTokens}
								promptCost={execution.promptCost}
								completionCost={execution.completionCost}
								totalCost={execution.totalCost}
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
								<p className="text-base">{execution.finishReason}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Latency (ms)</p>
								<p className="text-base">{execution.latency}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Response Code</p>
								<p className="text-base">{execution.responseCode}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Created At</p>
								<p className="text-base">
									{format(new UTCDate(execution.createdAt), dateTimeFormat)}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Updated At</p>
								<p className="text-base">
									{format(new UTCDate(execution.updatedAt), dateTimeFormat)}
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
					{vaultItems.length > 0 && (
						<div className="mt-6">
							<p className="text-sm text-muted-foreground mb-3">
								Generated Images
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{vaultItems.map(
									(item: { id?: string; path?: string; mediaType?: string }) => {
										const url = item?.path
											? signedUrlsByPath.get(item.path)
											: null;
										return (
											<div
												key={item.id ?? item.path}
												className="relative overflow-hidden rounded-md border border-border bg-muted/20"
											>
												{url ? (
													<img
														src={url}
														alt="Generated"
														className="h-48 w-full object-cover"
													/>
												) : (
													<div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
														Loading preview...
													</div>
												)}
											</div>
										);
									},
								)}
							</div>
						</div>
					)}
					{execution.response && (
						<div className="mt-6">
							<p className="text-sm text-muted-foreground">Response</p>
							<CodeView code={execution.response} language="json" />
						</div>
					)}
					{execution.errorMessage && (
						<div className="mt-6">
							<p className="text-sm text-muted-foreground text-destructive">
								Error Message
							</p>
							<p className="text-base whitespace-pre-wrap text-destructive">
								{execution.errorMessage}
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
