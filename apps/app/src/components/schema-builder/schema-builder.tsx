"use client";

import { useState } from "react";
import { Button } from "@proxed/ui/components/button";
import { PlusIcon, CodeIcon, GripVerticalIcon } from "lucide-react";
import type { JsonSchema } from "@proxed/structure";
import { SchemaNode } from "./schema-node";
import { AddFieldDialog } from "./add-field-dialog";
import { CodeImportDialog } from "./code-import-dialog";
import {
	DndContext,
	type DragEndEvent,
	closestCenter,
	useSensor,
	useSensors,
	PointerSensor,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { ScrollArea } from "@proxed/ui/components/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { toast } from "sonner";

interface SchemaBuilderProps {
	initialSchema: JsonSchema;
	onChange?: (schema: JsonSchema) => void;
}

export function SchemaBuilder({ initialSchema, onChange }: SchemaBuilderProps) {
	const [schema, setSchema] = useState<JsonSchema>(initialSchema);
	const [hasChanges, setHasChanges] = useState(false);
	const [isAddingField, setIsAddingField] = useState(false);
	const [isImportingCode, setIsImportingCode] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	function handleSchemaChange(newSchema: JsonSchema) {
		try {
			setSchema(newSchema);
			setHasChanges(true);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while updating the schema",
			);
		}
	}

	function handleSave() {
		try {
			onChange?.(schema);
			setHasChanges(false);
			toast.success("Schema saved successfully");
		} catch (_err) {
			toast.error("Failed to save schema");
		}
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

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		if (schema.type !== "object") return;

		const oldIndex = Object.keys(schema.fields).indexOf(active.id as string);
		const newIndex = Object.keys(schema.fields).indexOf(over.id as string);

		const fields = Object.entries(schema.fields);
		const [movedField] = fields.splice(oldIndex, 1);
		fields.splice(newIndex, 0, movedField);

		const newFields = Object.fromEntries(fields) as Record<string, JsonSchema>;
		handleSchemaChange({
			...schema,
			fields: newFields,
		});
	}

	if (schema.type !== "object") {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					Root schema must be an object type. Please import a valid schema or
					start with an empty object.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h3 className="text-lg font-medium">Schema Fields</h3>
					<p className="text-sm text-muted-foreground">
						Drag and drop fields to reorder them. Click on a field to edit its
						properties.
					</p>
				</div>
				<div className="flex gap-2">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsImportingCode(true)}
								>
									<CodeIcon className="h-4 w-4 mr-2" />
									Import Code
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Import schema from TypeScript, JSON, or Zod code</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="default"
									size="sm"
									onClick={() => setIsAddingField(true)}
								>
									<PlusIcon className="h-4 w-4 mr-2" />
									Add Field
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add a new field to the schema</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<Button
						variant="default"
						size="sm"
						onClick={handleSave}
						disabled={!hasChanges}
						className="ml-4"
					>
						{hasChanges ? "Save Changes" : "Saved"}
					</Button>
				</div>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{hasChanges && (
				<Alert>
					<AlertDescription className="flex items-center gap-2">
						<span>You have unsaved changes.</span>
						<Button variant="outline" size="sm" onClick={handleSave}>
							Save Now
						</Button>
					</AlertDescription>
				</Alert>
			)}

			<ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
				<div className="p-4 space-y-3">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={Object.keys(schema.fields)}
							strategy={verticalListSortingStrategy}
						>
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
						</SortableContext>
					</DndContext>
				</div>
			</ScrollArea>

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
