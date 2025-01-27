import { notFound } from "next/navigation";
import { getProject, getProviderKeys } from "@proxed/supabase/cached-queries";
import { ContentHeader } from "@/components/layout/content-header";
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
import { jsonToZodCode, jsonToSwiftCode } from "@proxed/structure";
import type { JsonSchema } from "@proxed/structure";
import { CodeView } from "@/components/schema-builder/code-view";
import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { getDeviceChecks } from "@proxed/supabase/cached-queries";

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

	const zodCodeResult = jsonToZodCode(schemaConfig);
	const generatedZodCode = zodCodeResult.success
		? zodCodeResult.data
		: "// Error generating Zod code";

	const swiftCodeResult = jsonToSwiftCode(schemaConfig);
	const generatedSwiftCode = swiftCodeResult.success
		? swiftCodeResult.data
		: "// Error generating Swift code";

	return (
		<div className="flex flex-col h-full">
			<ContentHeader>
				<div className="flex justify-between gap-4 flex-1 min-w-0 py-6">
					<h1 className="text-lg font-semibold truncate">{project.name}</h1>
				</div>
			</ContentHeader>

			<main className="flex-1 overflow-auto">
				<div className="max-w-screen-xl mx-auto p-6 space-y-6">
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
