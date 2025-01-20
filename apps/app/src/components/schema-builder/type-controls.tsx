"use client";

import { Input } from "@proxed/ui/components/input";
import { Switch } from "@proxed/ui/components/switch";
import { Label } from "@proxed/ui/components/label";
import type {
	JsonSchema,
	StringJsonSchema,
	NumberJsonSchema,
	ArrayJsonSchema,
	ObjectJsonSchema,
	EnumJsonSchema,
} from "@proxed/structure";
import { SchemaNode } from "./schema-node";
import { Button } from "@proxed/ui/components/button";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

interface TypeControlsProps {
	schema: JsonSchema;
	onUpdate: (schema: JsonSchema) => void;
	depth?: number;
}

export function StringControls({ schema, onUpdate }: TypeControlsProps) {
	const stringSchema = schema as StringJsonSchema;

	return (
		<div className="grid grid-cols-2 gap-4">
			<div className="space-y-2">
				<Label>Min Length</Label>
				<Input
					type="number"
					value={stringSchema.minLength || ""}
					onChange={(e) =>
						onUpdate({
							...stringSchema,
							minLength: Number.parseInt(e.target.value) || undefined,
						})
					}
				/>
			</div>
			<div className="space-y-2">
				<Label>Max Length</Label>
				<Input
					type="number"
					value={stringSchema.maxLength || ""}
					onChange={(e) =>
						onUpdate({
							...stringSchema,
							maxLength: Number.parseInt(e.target.value) || undefined,
						})
					}
				/>
			</div>
			<div className="col-span-2 flex items-center gap-2">
				<Switch
					checked={stringSchema.email}
					onCheckedChange={(email) => onUpdate({ ...stringSchema, email })}
				/>
				<Label>Email</Label>
			</div>
			<div className="col-span-2 flex items-center gap-2">
				<Switch
					checked={stringSchema.url}
					onCheckedChange={(url) => onUpdate({ ...stringSchema, url })}
				/>
				<Label>URL</Label>
			</div>
			<div className="col-span-2 flex items-center gap-2">
				<Switch
					checked={stringSchema.uuid}
					onCheckedChange={(uuid) => onUpdate({ ...stringSchema, uuid })}
				/>
				<Label>UUID</Label>
			</div>
		</div>
	);
}

export function NumberControls({ schema, onUpdate }: TypeControlsProps) {
	const numberSchema = schema as NumberJsonSchema;

	return (
		<div className="grid grid-cols-2 gap-4">
			<div className="space-y-2">
				<Label>Min</Label>
				<Input
					type="number"
					value={numberSchema.min ?? ""}
					onChange={(e) =>
						onUpdate({
							...numberSchema,
							min: Number.parseFloat(e.target.value) || undefined,
						})
					}
				/>
			</div>
			<div className="space-y-2">
				<Label>Max</Label>
				<Input
					type="number"
					value={numberSchema.max ?? ""}
					onChange={(e) =>
						onUpdate({
							...numberSchema,
							max: Number.parseFloat(e.target.value) || undefined,
						})
					}
				/>
			</div>
			<div className="col-span-2 flex items-center gap-2">
				<Switch
					checked={numberSchema.int}
					onCheckedChange={(int) => onUpdate({ ...numberSchema, int })}
				/>
				<Label>Integer</Label>
			</div>
		</div>
	);
}

export function ArrayControls({
	schema,
	onUpdate,
	depth,
}: TypeControlsProps & { depth?: number }) {
	const arraySchema = schema as ArrayJsonSchema;

	return (
		<div className="space-y-4">
			<SchemaNode
				name="Item Type"
				schema={arraySchema.itemType}
				onUpdate={(itemType) => onUpdate({ ...arraySchema, itemType })}
				onDelete={() => {}}
				depth={(depth || 0) + 1}
			/>
		</div>
	);
}

export function ObjectControls({
	schema,
	onUpdate,
	depth,
}: TypeControlsProps & { depth?: number }) {
	const objectSchema = schema as ObjectJsonSchema;

	return (
		<div className="space-y-4">
			{Object.entries(objectSchema.fields || {}).map(([name, field]) => (
				<SchemaNode
					key={name}
					name={name}
					schema={field}
					onUpdate={(updatedField) => {
						onUpdate({
							...objectSchema,
							fields: { ...objectSchema.fields, [name]: updatedField },
						});
					}}
					onDelete={() => {
						const { [name]: _, ...rest } = objectSchema.fields || {};
						onUpdate({ ...objectSchema, fields: rest });
					}}
					depth={(depth || 0) + 1}
				/>
			))}
		</div>
	);
}

export function EnumControls({ schema, onUpdate }: TypeControlsProps) {
	const enumSchema = schema as EnumJsonSchema;
	const [newValue, setNewValue] = useState("");

	const handleAddValue = () => {
		if (!newValue.trim()) return;
		if (enumSchema.values.includes(newValue)) return;

		onUpdate({
			...enumSchema,
			values: [...enumSchema.values, newValue],
		});
		setNewValue("");
	};

	const handleRemoveValue = (valueToRemove: string) => {
		onUpdate({
			...enumSchema,
			values: enumSchema.values.filter((v) => v !== valueToRemove),
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Input
					value={newValue}
					onChange={(e) => setNewValue(e.target.value)}
					placeholder="Add enum value..."
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleAddValue();
						}
					}}
				/>
				<Button
					variant="outline"
					onClick={handleAddValue}
					disabled={!newValue.trim()}
				>
					Add
				</Button>
			</div>
			<div className="flex flex-wrap gap-2">
				{enumSchema.values.map((value) => (
					<div
						key={value}
						className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"
					>
						<span className="text-sm">{value}</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-4 w-4 text-muted-foreground hover:text-destructive"
							onClick={() => handleRemoveValue(value)}
						>
							<Trash2Icon className="h-3 w-3" />
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
