"use client";

import { useState, useCallback, Fragment } from "react";
import { Card, CardContent } from "@proxed/ui/components/card";
import { Button } from "@proxed/ui/components/button";
import { Input } from "@proxed/ui/components/input";
import { Switch } from "@proxed/ui/components/switch";
import {
	ChevronRightIcon,
	Trash2Icon,
	GripVerticalIcon,
	PlusIcon,
	Settings2Icon,
	MoreHorizontalIcon,
	CopyIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	KeyboardIcon,
	CodeIcon,
} from "lucide-react";
import type { JsonSchema } from "@proxed/structure";
import { cn } from "@proxed/ui/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { Badge } from "@proxed/ui/components/badge";
import {
	StringControls,
	NumberControls,
	ArrayControls,
	ObjectControls,
	EnumControls,
} from "./type-controls";
import { Textarea } from "@proxed/ui/components/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@proxed/ui/components/popover";
import {
	Command,
	CommandInput,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "@proxed/ui/components/command";
import { useHotkeys } from "react-hotkeys-hook";
import { Label } from "@proxed/ui/components/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";

import { CodeView } from "./code-view";
import { EnumControls as EnumValidationControls } from "./type-controls";

interface SchemaNodeProps {
	name: string;
	schema: JsonSchema;
	onUpdate: (schema: JsonSchema) => void;
	onDelete: () => void;
	onRename?: (oldName: string, newName: string) => void;
	depth?: number;
}

type SchemaType = "string" | "number" | "boolean" | "array" | "object" | "enum";

const typeDescriptions: Record<SchemaType, string> = {
	string: "Text values like names, emails, or URLs",
	number: "Numeric values like integers or decimals",
	boolean: "True/false values",
	array: "List of items of the same type",
	object: "Complex type with multiple fields",
	enum: "Fixed set of possible values",
} as const;

const typeColors: Record<SchemaType, string> = {
	string: "text-blue-500 bg-blue-500/10",
	number: "text-green-500 bg-green-500/10",
	boolean: "text-yellow-500 bg-yellow-500/10",
	array: "text-purple-500 bg-purple-500/10",
	object: "text-orange-500 bg-orange-500/10",
	enum: "text-pink-500 bg-pink-500/10",
} as const;

function FieldHeader({
	name: fieldName,
	type,
	description,
	nullable,
	onDescriptionClick,
	values,
}: {
	name: string;
	type: string;
	description?: string;
	nullable?: boolean;
	onDescriptionClick?: () => void;
	values?: string[];
}) {
	const getTypeColor = (type: string) => {
		switch (type) {
			case "string":
				return "bg-blue-500/10 text-blue-500";
			case "number":
				return "bg-green-500/10 text-green-500";
			case "boolean":
				return "bg-yellow-500/10 text-yellow-500";
			case "array":
				return "bg-purple-500/10 text-purple-500";
			case "object":
				return "bg-orange-500/10 text-orange-500";
			case "enum":
				return "bg-pink-500/10 text-pink-500";
			default:
				return "bg-primary/10 text-primary";
		}
	};

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-2">
				<span className="font-medium text-sm">{fieldName}</span>
				<div className="flex gap-1.5">
					<Badge
						variant="secondary"
						className={cn("px-2 py-0.5 text-[10px]", getTypeColor(type))}
					>
						{type}
					</Badge>
					{nullable && (
						<Badge variant="outline" className="px-2 py-0.5 text-[10px]">
							nullable
						</Badge>
					)}
				</div>
			</div>
			<div className="flex items-center gap-2">
				{description ? (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDescriptionClick?.();
						}}
						className="text-xs text-muted-foreground hover:text-foreground truncate max-w-[300px] text-left group flex items-center gap-1"
					>
						<span>{description}</span>
						<span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
							(click to edit)
						</span>
					</button>
				) : (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDescriptionClick?.();
						}}
						className="text-xs text-muted-foreground hover:text-foreground italic group flex items-center gap-1"
					>
						<span>Add description...</span>
						<span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
							(click to add)
						</span>
					</button>
				)}
			</div>
			{type === "enum" && values && values.length > 0 && (
				<div className="mt-1 flex flex-wrap gap-1">
					{values.slice(0, 5).map((value: string) => (
						<Badge
							key={value}
							variant="outline"
							className="text-[10px] font-normal"
						>
							{value}
						</Badge>
					))}
					{values.length > 5 && (
						<Badge variant="outline" className="text-[10px] font-normal">
							+{values.length - 5} more
						</Badge>
					)}
				</div>
			)}
		</div>
	);
}

function TypeValidationControls({
	schema,
	onUpdate,
}: { schema: JsonSchema; onUpdate: (schema: JsonSchema) => void }) {
	const [isOpen, setIsOpen] = useState(false);

	const renderControls = () => {
		switch (schema.type) {
			case "string":
				return (
					<div className="space-y-3">
						<div className="space-y-2">
							<Label>Validation</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="flex items-center gap-2">
									<Switch
										checked={schema.email}
										onCheckedChange={(email) => onUpdate({ ...schema, email })}
									/>
									<span className="text-sm">Email</span>
								</div>
								<div className="flex items-center gap-2">
									<Switch
										checked={schema.url}
										onCheckedChange={(url) => onUpdate({ ...schema, url })}
									/>
									<span className="text-sm">URL</span>
								</div>
								<div className="flex items-center gap-2">
									<Switch
										checked={schema.uuid}
										onCheckedChange={(uuid) => onUpdate({ ...schema, uuid })}
									/>
									<span className="text-sm">UUID</span>
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Length</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground">Min</span>
									<Input
										type="number"
										value={schema.minLength || ""}
										onChange={(e) =>
											onUpdate({
												...schema,
												minLength: Number.parseInt(e.target.value) || undefined,
											})
										}
										className="h-8"
									/>
								</div>
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground">Max</span>
									<Input
										type="number"
										value={schema.maxLength || ""}
										onChange={(e) =>
											onUpdate({
												...schema,
												maxLength: Number.parseInt(e.target.value) || undefined,
											})
										}
										className="h-8"
									/>
								</div>
							</div>
						</div>
					</div>
				);
			case "number":
				return (
					<div className="space-y-3">
						<div className="space-y-2">
							<Label>Range</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground">Min</span>
									<Input
										type="number"
										value={schema.min || ""}
										onChange={(e) =>
											onUpdate({
												...schema,
												min: Number.parseFloat(e.target.value) || undefined,
											})
										}
										className="h-8"
									/>
								</div>
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground">Max</span>
									<Input
										type="number"
										value={schema.max || ""}
										onChange={(e) =>
											onUpdate({
												...schema,
												max: Number.parseFloat(e.target.value) || undefined,
											})
										}
										className="h-8"
									/>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								checked={schema.int}
								onCheckedChange={(int) => onUpdate({ ...schema, int })}
							/>
							<span className="text-sm">Integer only</span>
						</div>
					</div>
				);
			case "array":
				return (
					<div className="space-y-3">
						<div className="space-y-2">
							<Label>Length</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground">
										Min Items
									</span>
									<Input
										type="number"
										value={schema.minItems || ""}
										onChange={(e) =>
											onUpdate({
												...schema,
												minItems: Number.parseInt(e.target.value) || undefined,
											})
										}
										className="h-8"
									/>
								</div>
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground">
										Max Items
									</span>
									<Input
										type="number"
										value={schema.maxItems || ""}
										onChange={(e) =>
											onUpdate({
												...schema,
												maxItems: Number.parseInt(e.target.value) || undefined,
											})
										}
										className="h-8"
									/>
								</div>
							</div>
						</div>
					</div>
				);
			case "enum":
				return <EnumValidationControls schema={schema} onUpdate={onUpdate} />;
			default:
				return null;
		}
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"text-muted-foreground hover:text-foreground transition-colors",
						isOpen && "text-foreground",
					)}
				>
					<Settings2Icon className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Badge
							variant="secondary"
							className={typeColors[schema.type as SchemaType]}
						>
							{schema.type}
						</Badge>
						<span className="text-sm font-medium">Validation Rules</span>
					</div>
					{renderControls()}
				</div>
			</PopoverContent>
		</Popover>
	);
}

function QuickActionsMenu({
	schema,
	onUpdate,
	onDelete,
	onDuplicate,
	onMoveUp,
	onMoveDown,
}: {
	schema: JsonSchema;
	onUpdate: (schema: JsonSchema) => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground hover:text-foreground"
				>
					<MoreHorizontalIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={onDuplicate} className="gap-2">
					<CopyIcon className="h-4 w-4" />
					<span>Duplicate Field</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onMoveUp} className="gap-2">
					<ArrowUpIcon className="h-4 w-4" />
					<span>Move Up</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onMoveDown} className="gap-2">
					<ArrowDownIcon className="h-4 w-4" />
					<span>Move Down</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={onDelete}
					className="text-destructive focus:text-destructive gap-2"
				>
					<Trash2Icon className="h-4 w-4" />
					<span>Delete Field</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function HotkeyBadge({ combo, label }: { combo: string[]; label: string }) {
	return (
		<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
			{combo.map((key, i) => (
				<Fragment key={i}>
					<kbd className="px-1.5 py-0.5 bg-muted rounded-md border text-[10px] font-medium shadow-sm">
						{key}
					</kbd>
					{i < combo.length - 1 && <span>+</span>}
				</Fragment>
			))}
			<span className="text-[10px]">{label}</span>
		</div>
	);
}

function getTypeScriptPreview(
	name: string,
	schema: JsonSchema,
	indentLevel = 0,
): string {
	const indent = "  ".repeat(indentLevel);
	const nullSuffix = schema.nullable ? " | null" : "";

	let typeStr = "";
	switch (schema.type) {
		case "string":
			typeStr = "string";
			if (schema.email) typeStr += " // email";
			if (schema.url) typeStr += " // url";
			if (schema.uuid) typeStr += " // uuid";
			break;
		case "number":
			typeStr = schema.int ? "number // integer" : "number";
			break;
		case "boolean":
			typeStr = "boolean";
			break;
		case "array":
			typeStr = `Array<${schema.itemType ? getTypeScriptPreview("", schema.itemType).trim() : "any"}>`;
			break;
		case "object":
			if (!schema.fields || Object.keys(schema.fields).length === 0) {
				typeStr = "Record<string, any>";
			} else {
				typeStr = "{\n";
				Object.entries(schema.fields).forEach(([fieldName, field]) => {
					typeStr += getTypeScriptPreview(fieldName, field, indentLevel + 1);
				});
				typeStr += `${indent}}`;
			}
			break;
		case "enum":
			typeStr = schema.values?.length
				? schema.values.map((v) => `"${v}"`).join(" | ")
				: "string";
			break;
		default:
			typeStr = "any";
	}

	return indentLevel === 0
		? `${typeStr}${nullSuffix};\n`
		: `${indent}${name}: ${typeStr}${nullSuffix};\n`;
}

function HotkeysDisplay({
	type,
	name,
	schema,
}: { type: JsonSchema["type"]; name: string; schema: JsonSchema }) {
	const hotkeys = [
		{ combo: ["Alt", "E"], label: "edit name" },
		{ combo: ["Alt", "D"], label: "edit description" },
		{ combo: ["Alt", "O"], label: "toggle nullable" },
		{ combo: ["Alt", "T"], label: "change type" },
		...(type === "object" ? [{ combo: ["Alt", "A"], label: "add field" }] : []),
	];

	const typeScriptCode = `interface Schema {\n${getTypeScriptPreview(name, schema, 1)}}`;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground hover:text-foreground gap-1.5"
				>
					<KeyboardIcon className="h-3.5 w-3.5" />
					<span className="text-xs">Shortcuts</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] p-3" align="end">
				<div className="space-y-4">
					<div className="flex items-center gap-2 pb-2 border-b">
						<KeyboardIcon className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium">Keyboard Shortcuts</span>
					</div>
					<div className="grid gap-2">
						{hotkeys.map((hotkey) => (
							<HotkeyBadge
								key={hotkey.combo.join("+")}
								combo={hotkey.combo}
								label={hotkey.label}
							/>
						))}
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2 pb-1 border-b">
							<CodeIcon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">TypeScript Preview</span>
						</div>
						<div className="rounded-md overflow-hidden">
							<CodeView code={typeScriptCode} language="typescript" />
						</div>
					</div>
					<div className="pt-2 border-t">
						<p className="text-[10px] text-muted-foreground">
							Press{" "}
							<kbd className="px-1 bg-muted rounded border text-[10px]">?</kbd>{" "}
							anywhere to show all shortcuts
						</p>
					</div>
				</div>
			</PopoverContent>
		</Popover>
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
	const [newFieldName, setNewFieldName] = useState("");
	const [isAddingField, setIsAddingField] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: name });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

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
				nullable: schema.nullable,
				optional: false,
				description: schema.description,
			};

			const newSchema = (() => {
				switch (type) {
					case "string":
						return { ...baseProps };
					case "number":
						return { ...baseProps };
					case "array":
						return { ...baseProps, itemType: { type: "string" } };
					case "object":
						return { ...baseProps, fields: {} };
					case "enum":
						return { ...baseProps };
					default:
						return baseProps;
				}
			})() as JsonSchema;

			onUpdate(newSchema);
		},
		[schema.nullable, schema.description, onUpdate],
	);

	const handleQuickAdd = (type: SchemaType) => {
		if (!newFieldName.trim()) return;

		const fieldSchema: JsonSchema = {
			type,
			nullable: false,
			optional: false,
		} as JsonSchema;

		if (type === "object") {
			(fieldSchema as any).fields = {};
		} else if (type === "array") {
			(fieldSchema as any).itemType = { type: "string" };
		}

		if (schema.type === "object") {
			onUpdate({
				...schema,
				fields: {
					...schema.fields,
					[newFieldName]: fieldSchema,
				},
			});
		}

		setNewFieldName("");
		setIsAddingField(false);
	};

	const handleDuplicate = useCallback(() => {
		if (schema.type !== "object") return;
		const newName = `${name}Copy`;
		onUpdate({
			...schema,
			fields: {
				...schema.fields,
				[newName]: schema,
			},
		});
	}, [name, schema, onUpdate]);

	const handleMoveUp = useCallback(() => {
		if (schema.type !== "object") return;
		const fields = Object.entries(schema.fields);
		const index = fields.findIndex(([key]) => key === name);
		if (index <= 0) return;

		const newFields = [...fields];
		[newFields[index - 1], newFields[index]] = [
			newFields[index],
			newFields[index - 1],
		];
		onUpdate({
			...schema,
			fields: Object.fromEntries(newFields),
		});
	}, [name, schema, onUpdate]);

	const handleMoveDown = useCallback(() => {
		if (schema.type !== "object") return;
		const fields = Object.entries(schema.fields);
		const index = fields.findIndex(([key]) => key === name);
		if (index === -1 || index === fields.length - 1) return;

		const newFields = [...fields];
		[newFields[index], newFields[index + 1]] = [
			newFields[index + 1],
			newFields[index],
		];
		onUpdate({
			...schema,
			fields: Object.fromEntries(newFields),
		});
	}, [name, schema, onUpdate]);

	// Keyboard shortcuts
	useHotkeys("alt+e", () => setIsEditing(true), { enableOnFormTags: true });
	useHotkeys("alt+d", () => setIsEditingDescription(true), {
		enableOnFormTags: true,
	});
	useHotkeys(
		"alt+a",
		() => schema.type === "object" && setIsAddingField(true),
		{ enableOnFormTags: true },
	);
	useHotkeys(
		"alt+o",
		() => onUpdate({ ...schema, nullable: !schema.nullable, optional: false }),
		{ enableOnFormTags: true },
	);

	// Quick type change with keyboard
	useHotkeys(
		"alt+t",
		(e) => {
			e.preventDefault();
			const typeList = Object.keys(typeDescriptions) as SchemaType[];
			const currentIndex = typeList.indexOf(schema.type as SchemaType);
			const nextIndex = (currentIndex + 1) % typeList.length;
			handleTypeChange(typeList[nextIndex] as JsonSchema["type"]);
		},
		{ enableOnFormTags: true },
	);

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"relative transition-all duration-200 group/card focus-within:ring-2 focus-within:ring-primary",
				depth > 0 && "ml-6 border-l-4 border-l-border",
				isHovered && "shadow-md ring-1 ring-border",
				isDragging && "opacity-50 cursor-grabbing",
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					setIsEditing(true);
				}
			}}
		>
			<CardContent className="p-4">
				<div className="flex items-center gap-4">
					<div
						{...attributes}
						{...listeners}
						className={cn(
							"cursor-grab active:cursor-grabbing p-1.5 hover:bg-accent rounded-md transition-all",
							"opacity-0 group-hover/card:opacity-100 hover:scale-105",
						)}
					>
						<GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
					</div>

					{(schema.type === "object" || schema.type === "array") && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsExpanded(!isExpanded)}
							className={cn(
								"p-1.5 hover:bg-accent rounded-md transition-all duration-200",
								isExpanded && "rotate-90",
								"opacity-50 hover:opacity-100",
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
									} else if (e.key === "Escape") {
										setFieldName(name);
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
									nullable={schema.nullable}
									onDescriptionClick={() => setIsEditingDescription(true)}
									{...(schema.type === "enum" &&
										schema.values && { values: schema.values })}
								/>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<HotkeysDisplay type={schema.type} name={name} schema={schema} />
						<TypeValidationControls schema={schema} onUpdate={onUpdate} />
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-2">
										<Switch
											checked={schema.nullable}
											onCheckedChange={(isChecked) =>
												onUpdate({
													...schema,
													nullable: isChecked,
													optional: false,
												})
											}
											className="scale-75"
										/>
										<span className="text-xs text-muted-foreground">
											Nullable
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Make this field nullable</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<QuickActionsMenu
							schema={schema}
							onUpdate={onUpdate}
							onDelete={onDelete}
							onDuplicate={handleDuplicate}
							onMoveUp={handleMoveUp}
							onMoveDown={handleMoveDown}
						/>
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

				{isExpanded && schema.type === "object" && (
					<div className="mt-4 pl-4 border-l border-border space-y-3">
						{Object.entries(schema.fields || {}).map(([fieldName, field]) => (
							<SchemaNode
								key={fieldName}
								name={fieldName}
								schema={field}
								onUpdate={(updatedField) => {
									onUpdate({
										...schema,
										fields: {
											...schema.fields,
											[fieldName]: updatedField,
										},
									});
								}}
								onDelete={() => {
									const { [fieldName]: _, ...rest } = schema.fields;
									onUpdate({
										...schema,
										fields: rest,
									});
								}}
								onRename={(oldName, newName) => {
									const fields = { ...schema.fields };
									const field = fields[oldName];
									if (!field) return;

									delete fields[oldName];
									fields[newName] = field;

									onUpdate({
										...schema,
										fields,
									});
								}}
								depth={depth + 1}
							/>
						))}

						{/* Inline field creation */}
						<div className="flex items-center gap-2">
							{isAddingField ? (
								<div className="flex-1 flex items-center gap-2">
									<Input
										value={newFieldName}
										onChange={(e) => setNewFieldName(e.target.value)}
										placeholder="Field name..."
										className="h-8"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === "Escape") {
												setIsAddingField(false);
												setNewFieldName("");
											}
										}}
									/>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" size="sm">
												Select Type
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0" align="start">
											<Command>
												<CommandInput placeholder="Search type..." />
												<CommandEmpty>No type found.</CommandEmpty>
												<CommandGroup>
													{Object.entries(typeDescriptions).map(
														([key, desc]) => (
															<CommandItem
																key={key}
																onSelect={() =>
																	handleQuickAdd(key as SchemaType)
																}
																className="flex items-center gap-2"
															>
																<Badge
																	variant="secondary"
																	className={typeColors[key as SchemaType]}
																>
																	{key}
																</Badge>
																<span className="text-xs text-muted-foreground">
																	{desc}
																</span>
															</CommandItem>
														),
													)}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setIsAddingField(false);
											setNewFieldName("");
										}}
									>
										Cancel
									</Button>
								</div>
							) : (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsAddingField(true)}
									className="gap-1 text-muted-foreground hover:text-foreground"
								>
									<PlusIcon className="h-4 w-4" />
									Add Field
								</Button>
							)}
						</div>
					</div>
				)}

				{isExpanded && schema.type === "array" && (
					<div className="mt-4 pl-4 border-l border-border">
						<SchemaNode
							key="itemType"
							name="Item Type"
							schema={schema.itemType}
							onUpdate={(updatedField) => {
								onUpdate({
									...schema,
									itemType: updatedField,
								});
							}}
							onDelete={() => {}} // Array item type cannot be deleted
							depth={depth + 1}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
