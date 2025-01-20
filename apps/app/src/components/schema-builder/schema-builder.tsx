"use client";

import { useState } from "react";
import { Button } from "@proxed/ui/components/button";
import { PlusIcon, CodeIcon } from "lucide-react";
import type { JsonSchema } from "@proxed/structure";
import { SchemaNode } from "./schema-node";
import { AddFieldDialog } from "./add-field-dialog";
import { CodeImportDialog } from "./code-import-dialog";

interface SchemaBuilderProps {
	initialSchema: JsonSchema;
	onChange?: (schema: JsonSchema) => void;
}

export function SchemaBuilder({ initialSchema, onChange }: SchemaBuilderProps) {
	const [schema, setSchema] = useState<JsonSchema>(initialSchema);
	const [isAddingField, setIsAddingField] = useState(false);
	const [isImportingCode, setIsImportingCode] = useState(false);

	function handleSchemaChange(newSchema: JsonSchema) {
		setSchema(newSchema);
		onChange?.(newSchema);
	}

	function handleImport(importedSchema: JsonSchema) {
		const finalSchema =
			importedSchema.type !== "object"
				? { ...importedSchema, type: "object" as const, fields: {} }
				: importedSchema;

		handleSchemaChange(finalSchema);
	}

	function handleFieldRename(oldName: string, newName: string) {
		if (oldName === newName) return;
		if (schema.type !== "object") return;

		const fields = { ...schema.fields };
		const field = fields[oldName];
		if (!field) return;

		delete fields[oldName];
		fields[newName] = field;

		handleSchemaChange({
			...schema,
			fields,
		});
	}

	if (schema.type !== "object") {
		return <div>Root schema must be an object type</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">Schema Fields</h3>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsImportingCode(true)}
					>
						<CodeIcon className="h-4 w-4 mr-2" />
						Import Code
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsAddingField(true)}
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Add Field
					</Button>
				</div>
			</div>

			<div className="space-y-3">
				{Object.entries(schema.fields).map(([name, field]) => (
					<SchemaNode
						key={name}
						name={name}
						schema={field}
						onUpdate={(updatedField) => {
							handleSchemaChange({
								...schema,
								fields: {
									...schema.fields,
									[name]: updatedField,
								},
							});
						}}
						onDelete={() => {
							const { [name]: _, ...rest } = schema.fields;
							handleSchemaChange({
								...schema,
								fields: rest,
							});
						}}
						onRename={handleFieldRename}
					/>
				))}
			</div>

			<AddFieldDialog
				open={isAddingField}
				onClose={() => setIsAddingField(false)}
				onAdd={(name, field) => {
					handleSchemaChange({
						...schema,
						fields: {
							...schema.fields,
							[name]: field,
						},
					});
					setIsAddingField(false);
				}}
			/>

			<CodeImportDialog
				open={isImportingCode}
				onClose={() => setIsImportingCode(false)}
				onImport={handleImport}
			/>
		</div>
	);
}
