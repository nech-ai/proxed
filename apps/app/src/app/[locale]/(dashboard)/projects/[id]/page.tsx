import { notFound } from "next/navigation";
import { getProject, getProviderKeys } from "@proxed/supabase/cached-queries";
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
import { CodeIcon, EyeIcon, SmartphoneIcon } from "lucide-react";
import { SchemaBuilderWrapper } from "@/components/schema-builder/schema-builder-wrapper";
import { ZodParser, SwiftParser } from "@proxed/structure";
import type { JsonSchema } from "@proxed/structure";
import { CodeView } from "@/components/schema-builder/code-view";
import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { getDeviceChecks } from "@proxed/supabase/cached-queries";
import { PageHeader } from "@/components/layout/page-header";

export async function generateMetadata(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const { data: project } = await getProject(id);
	if (!project || !project.id) {
		notFound();
	}

	return {
		title: `${project.name} | Proxed`,
	};
}

export default async function Page(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const { data: project } = await getProject(id);
	const deviceChecks = await getDeviceChecks();
	const keys = await getProviderKeys();
	if (!project || !project.id) {
		notFound();
	}

	const schemaConfig = (project.schema_config || {
		type: "object",
		fields: {},
	}) as JsonSchema;

	const zodParser = new ZodParser();
	const swiftParser = new SwiftParser("");

	const generatedZodCode = zodParser.fromJsonSchema(schemaConfig, "schema");
	const generatedSwiftCode = swiftParser.fromJsonSchema(schemaConfig, "Schema");

	return (
		<div className="flex flex-col h-full">
			<PageHeader title={project.name} />

			<main className="flex-1 overflow-auto bg-muted/5">
				<div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
					<ProjectEditForm
						project={project}
						// @ts-expect-error
						deviceChecks={deviceChecks?.data || []}
						// @ts-expect-error
						keys={keys?.data || []}
					/>

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
									<SchemaBuilderWrapper
										projectId={project.id}
										initialSchema={schemaConfig}
									/>
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
				</div>
			</main>
		</div>
	);
}
