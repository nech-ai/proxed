"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@proxed/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@proxed/ui/components/tabs";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@proxed/ui/components/alert";
import {
	AlertTriangleIcon,
	CodeIcon,
	EyeIcon,
	SmartphoneIcon,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { SchemaBuilderWrapper } from "@/components/schema-builder/schema-builder-wrapper";
import { CodeView } from "@/components/schema-builder/code-view";
import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { ProjectTestMode } from "@/components/projects/project-test-mode";
import { ProjectConnectionDetails } from "@/components/projects/project-connection-details";
import { ZodParser, SwiftParser } from "@proxed/structure";
import type { JsonSchema } from "@proxed/structure";

const defaultSchema: JsonSchema = {
	type: "object",
	fields: {},
};

const schemaTypes = [
	"object",
	"string",
	"number",
	"boolean",
	"array",
	"union",
	"intersection",
	"enum",
	"literal",
	"date",
	"any",
	"unknown",
	"record",
	"branded",
	"promise",
	"lazy",
] as const;

type SchemaType = (typeof schemaTypes)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isSchemaType(value: unknown): value is SchemaType {
	return (
		typeof value === "string" &&
		schemaTypes.some((schemaType) => schemaType === value)
	);
}

function isJsonSchema(value: unknown): value is JsonSchema {
	return isRecord(value) && isSchemaType(value.type);
}

export function ProjectDetails({ projectId }: { projectId: string }) {
	const trpc = useTRPC();
	const { data: project } = useQuery(
		trpc.projects.byId.queryOptions({ id: projectId }),
	);

	if (!project) {
		return null;
	}

	const schemaConfig = isJsonSchema(project.schemaConfig)
		? project.schemaConfig
		: defaultSchema;

	const zodParser = new ZodParser();
	const swiftParser = new SwiftParser("");

	const generatedZodCode = zodParser.fromJsonSchema(schemaConfig, "schema");
	const generatedSwiftCode = swiftParser.fromJsonSchema(schemaConfig, "Schema");

	return (
		<div className="flex flex-col h-full">
			<PageHeader title={project.name} />

			<main className="flex-1 overflow-auto bg-muted/5">
				<div className="container mx-auto px-4 py-8 space-y-6">
					{project.testMode && (
						<Alert
							variant="default"
							className="bg-yellow-500/15 border-yellow-500 text-yellow-900 dark:text-yellow-200"
						>
							<AlertTriangleIcon className="h-4 w-4" />
							<AlertTitle>Test Mode Enabled</AlertTitle>
							<AlertDescription>
								This project is in test mode. Apple DeviceCheck validation will
								be bypassed for requests with the correct test key header.
							</AlertDescription>
						</Alert>
					)}

					<ProjectEditForm projectId={projectId} />

					<ProjectConnectionDetails projectId={projectId} />

					<Card>
						<CardHeader>
							<CardTitle>Schema Builder</CardTitle>
							<CardDescription>
								Define your project's schema using the visual builder below
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="visual" className="w-full">
								<TabsList className="mb-4">
									<TabsTrigger value="visual">
										<EyeIcon className="h-4 w-4 mr-2" />
										Visual Editor
									</TabsTrigger>
									<TabsTrigger value="typescript">
										<CodeIcon className="h-4 w-4 mr-2" />
										TypeScript
									</TabsTrigger>
									<TabsTrigger value="swift">
										<SmartphoneIcon className="h-4 w-4 mr-2" />
										Swift
									</TabsTrigger>
								</TabsList>
								<TabsContent value="visual" className="mt-0">
									<SchemaBuilderWrapper projectId={projectId} />
								</TabsContent>
								<TabsContent value="typescript" className="mt-0">
									<CodeView code={generatedZodCode} language="typescript" />
								</TabsContent>
								<TabsContent value="swift" className="mt-0">
									<CodeView code={generatedSwiftCode} language="swift" />
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>

					<ProjectTestMode projectId={projectId} />
				</div>
			</main>
		</div>
	);
}
