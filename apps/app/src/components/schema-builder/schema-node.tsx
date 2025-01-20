"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@proxed/ui/components/card";
import { Button } from "@proxed/ui/components/button";
import { Input } from "@proxed/ui/components/input";
import { Switch } from "@proxed/ui/components/switch";
import { ChevronRightIcon, Trash2Icon } from "lucide-react";
import type { JsonSchema } from "@proxed/structure";
import { cn } from "@proxed/ui/utils";
import {
	StringControls,
	NumberControls,
	ArrayControls,
	ObjectControls,
	EnumControls,
} from "./type-controls";
import { Textarea } from "@proxed/ui/components/textarea";

interface SchemaNodeProps {
	name: string;
	schema: JsonSchema;
	onUpdate: (schema: JsonSchema) => void;
	onDelete: () => void;
	onRename?: (oldName: string, newName: string) => void;
	depth?: number;
}

const schemaTypes = [
	{ value: "string", label: "String" },
	{ value: "number", label: "Number" },
	{ value: "boolean", label: "Boolean" },
	{ value: "array", label: "Array" },
	{ value: "object", label: "Object" },
	{ value: "enum", label: "Enum" },
] as const;

function FieldHeader({
	name,
	type,
	description,
	optional,
	onDescriptionClick,
}: {
	name: string;
	type: string;
	description?: string;
	optional?: boolean;
	onDescriptionClick?: () => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				<span className="font-medium text-sm">{name}</span>
				{optional && (
					<span className="text-xs text-muted-foreground">optional</span>
				)}
			</div>
			<div className="flex items-center gap-2">
				<span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
					{type}
				</span>
				{description ? (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDescriptionClick?.();
						}}
						className="text-xs text-muted-foreground hover:text-foreground truncate max-w-[300px] text-left"
					>
						{description}
					</button>
				) : (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDescriptionClick?.();
						}}
						className="text-xs text-muted-foreground hover:text-foreground italic"
					>
						Add description...
					</button>
				)}
			</div>
		</div>
	);
}

export function SchemaNode({
	name,
	schema,
	onUpdate,
	onDelete,
	onRename,
	depth = 0,
}: SchemaNodeProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isHovered, setIsHovered] = useState(false);
	const [fieldName, setFieldName] = useState(name);
	const [isEditing, setIsEditing] = useState(false);
	const [isEditingDescription, setIsEditingDescription] = useState(false);

	const handleRename = useCallback(
		(newName: string) => {
			if (newName !== name && onRename) {
				onRename(name, newName);
			}
		},
		[name, onRename],
	);

	const handleTypeChange = useCallback(
		(type: JsonSchema["type"]) => {
			const baseProps = {
				type,
				optional: schema.optional,
				nullable: schema.nullable,
				description: schema.description,
			};

			const newSchema = (() => {
				switch (type) {
					case "string":
						return { ...baseProps, minLength: undefined, maxLength: undefined };
					case "number":
						return { ...baseProps, min: undefined, max: undefined, int: false };
					case "array":
						return { ...baseProps, itemType: { type: "string" } };
					case "object":
						return { ...baseProps, fields: {} };
					case "enum":
						return { ...baseProps, values: [] };
					default:
						return baseProps;
				}
			})() as JsonSchema;

			onUpdate(newSchema);
		},
		[schema.optional, schema.nullable, schema.description, onUpdate],
	);

	return (
		<Card
			className={cn(
				"relative transition-all duration-200",
				depth > 0 && "ml-6 border-l-4 border-l-border",
				isHovered && "shadow-md ring-1 ring-border",
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<CardContent className="p-4">
				<div className="flex items-center gap-4">
					{(schema.type === "object" || schema.type === "array") && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsExpanded(!isExpanded)}
							className={cn(
								"p-1 hover:bg-accent rounded transition-transform duration-200",
								isExpanded && "rotate-90",
							)}
						>
							<ChevronRightIcon className="h-4 w-4" />
						</Button>
					)}

					<div className="flex-1 min-w-0">
						{isEditing ? (
							<Input
								value={fieldName}
								onChange={(e) => setFieldName(e.target.value)}
								onBlur={() => {
									handleRename(fieldName);
									setIsEditing(false);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleRename(fieldName);
										setIsEditing(false);
									}
								}}
								autoFocus
								className="w-full"
							/>
						) : (
							<div
								onClick={() => setIsEditing(true)}
								className="cursor-pointer hover:opacity-80"
							>
								<FieldHeader
									name={fieldName}
									type={schema.type}
									description={schema.description}
									optional={schema.optional}
									onDescriptionClick={() => setIsEditingDescription(true)}
								/>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Switch
							checked={schema.optional}
							onCheckedChange={(optional) => onUpdate({ ...schema, optional })}
							className="scale-75"
						/>

						<Button
							variant="ghost"
							size="sm"
							onClick={onDelete}
							className={cn(
								"text-muted-foreground hover:text-destructive transition-opacity duration-200",
								isHovered ? "opacity-100" : "opacity-0",
							)}
						>
							<Trash2Icon className="h-3 w-3" />
						</Button>
					</div>
				</div>

				{isEditingDescription && (
					<div className="mt-4">
						<Textarea
							value={schema.description || ""}
							onChange={(e) =>
								onUpdate({ ...schema, description: e.target.value })
							}
							onBlur={() => setIsEditingDescription(false)}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									setIsEditingDescription(false);
								}
							}}
							placeholder="Add a description for this field..."
							className="mt-1 text-sm resize-none h-20"
							autoFocus
						/>
					</div>
				)}

				{isExpanded &&
					(schema.type === "object" || schema.type === "array") && (
						<div className="mt-4 pl-4 border-l border-border space-y-3">
							{schema.type === "string" && (
								<StringControls schema={schema} onUpdate={onUpdate} />
							)}
							{schema.type === "number" && (
								<NumberControls schema={schema} onUpdate={onUpdate} />
							)}
							{schema.type === "array" && (
								<ArrayControls
									schema={schema}
									onUpdate={onUpdate}
									depth={depth}
								/>
							)}
							{schema.type === "object" && (
								<ObjectControls
									schema={schema}
									onUpdate={onUpdate}
									depth={depth}
								/>
							)}
							{schema.type === "enum" && (
								<EnumControls schema={schema} onUpdate={onUpdate} />
							)}
						</div>
					)}
			</CardContent>
		</Card>
	);
}
