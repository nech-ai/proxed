"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@proxed/ui/components/dialog";
import { Button } from "@proxed/ui/components/button";
import { Input } from "@proxed/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import type { JsonSchema } from "@proxed/structure";
import { Label } from "@proxed/ui/components/label";
import { Textarea } from "@proxed/ui/components/textarea";
import { Switch } from "@proxed/ui/components/switch";
import { Badge } from "@proxed/ui/components/badge";
import { Card, CardContent } from "@proxed/ui/components/card";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { InfoIcon } from "lucide-react";

interface AddFieldDialogProps {
	open: boolean;
	onClose: () => void;
	onAdd: (name: string, schema: JsonSchema) => void;
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

export function AddFieldDialog({ open, onClose, onAdd }: AddFieldDialogProps) {
	const [name, setName] = useState("");
	const [type, setType] = useState<SchemaType>("string");
	const [description, setDescription] = useState("");
	const [isNullable, setIsNullable] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function validateName(name: string) {
		if (!name.trim()) return "Field name is required";
		if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
			return "Field name must start with a letter or underscore and contain only letters, numbers, and underscores";
		}
		return null;
	}

	function handleAdd() {
		const nameError = validateName(name);
		if (nameError) {
			setError(nameError);
			return;
		}

		const baseSchema: JsonSchema = {
			type,
			nullable: isNullable,
			description: description || undefined,
		} as JsonSchema;

		// Add type-specific properties
		switch (type) {
			case "object":
				(baseSchema as any).fields = {};
				break;
			case "array":
				(baseSchema as any).itemType = { type: "string" };
				break;
		}

		onAdd(name, baseSchema);
		setName("");
		setType("string");
		setDescription("");
		setIsNullable(false);
		setError(null);
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add New Field</DialogTitle>
					<DialogDescription>
						Create a new field with type and validation rules
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="grid grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Field Name</Label>
								<Input
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										setError(null);
									}}
									placeholder="e.g., firstName"
									autoFocus
									className={error ? "border-destructive" : ""}
								/>
								{error && <p className="text-xs text-destructive">{error}</p>}
							</div>

							<div className="space-y-2">
								<Label>Field Type</Label>
								<Select
									value={type}
									onValueChange={(v) => setType(v as SchemaType)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(typeDescriptions).map(([key, desc]) => (
											<SelectItem
												key={key}
												value={key}
												className="flex items-center justify-between"
											>
												<div className="flex items-center gap-2">
													<Badge
														variant="secondary"
														className={
															typeColors[key as keyof typeof typeColors]
														}
													>
														{key}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{desc}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Description</Label>
								<Textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Add a description for this field..."
									className="h-20"
								/>
							</div>

							<div className="flex items-center gap-2">
								<Switch checked={isNullable} onCheckedChange={setIsNullable} />
								<Label className="!m-0">Nullable Field</Label>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<InfoIcon className="h-4 w-4" />
								<span>Preview</span>
							</div>

							<Card>
								<CardContent className="p-4">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">
												{name || "fieldName"}
											</span>
											{isNullable && (
												<Badge variant="outline" className="text-[10px]">
													nullable
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className={typeColors[type]}>
												{type}
											</Badge>
											{description && (
												<span className="text-xs text-muted-foreground truncate">
													{description}
												</span>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							<Alert>
								<AlertDescription className="text-xs">
									{typeDescriptions[type]}.{" "}
									{isNullable && "This field is nullable."}
								</AlertDescription>
							</Alert>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleAdd} disabled={!name.trim()}>
						Add Field
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
