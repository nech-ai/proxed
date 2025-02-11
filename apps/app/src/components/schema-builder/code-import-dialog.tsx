"use client";

import { useState } from "react";
import { Button } from "@proxed/ui/components/button";
import { Textarea } from "@proxed/ui/components/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@proxed/ui/components/dialog";
import { ZodParser, SwiftParser } from "@proxed/structure";
import type { JsonSchema } from "@proxed/structure";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { AlertCircle } from "lucide-react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@proxed/ui/components/tabs";

interface CodeImportDialogProps {
	open: boolean;
	onClose: () => void;
	onImport: (schema: JsonSchema) => void;
}

type CodeType = "zod" | "swift";

export function CodeImportDialog({
	open,
	onClose,
	onImport,
}: CodeImportDialogProps) {
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [codeType, setCodeType] = useState<CodeType>("zod");

	const handleImport = () => {
		try {
			setError(null);
			let result: {
				success: boolean;
				data?: JsonSchema;
				errors?: Array<{ message: string }>;
			};

			if (codeType === "zod") {
				const parser = new ZodParser();
				const ast = parser.parse(code);
				result = { success: true, data: parser.toJsonSchema(ast) };
			} else {
				const parser = new SwiftParser(code);
				const ast = parser.parse();
				result = { success: true, data: parser.toJsonSchema(ast) };
			}

			if (!result.success || !result.data) {
				setError(
					result.errors?.[0]?.message || `Failed to parse ${codeType} schema`,
				);
				return;
			}

			onImport(result.data);
			onClose();
			setCode("");
			toast.success("Schema imported successfully");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: `Failed to parse ${codeType} schema`;
			setError(errorMessage);
		}
	};

	const getPlaceholder = () => {
		if (codeType === "zod") {
			return `import { z } from "zod";

export const mySchema = z.object({
  name: z.string(),
  age: z.number(),
  // ...
});`;
		}

		return `struct User: Codable {
    var name: String
    var age: Int
    var email: String?
    var addresses: [Address]

    struct Address: Codable {
        var street: String
        var city: String
    }
}`;
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Import Schema</DialogTitle>
					<DialogDescription>
						Paste your schema code below. You can import from Zod TypeScript
						code or Swift structs.
					</DialogDescription>
				</DialogHeader>
				<Tabs
					defaultValue="zod"
					onValueChange={(v) => setCodeType(v as CodeType)}
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="zod">Zod Schema</TabsTrigger>
						<TabsTrigger value="swift">Swift Struct</TabsTrigger>
					</TabsList>
					<TabsContent value="zod">
						<div className="py-4 space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="ml-2">{error}</AlertDescription>
								</Alert>
							)}
							<div className="relative">
								<Textarea
									value={code}
									onChange={(e) => {
										setCode(e.target.value);
										setError(null);
									}}
									placeholder={getPlaceholder()}
									className="font-mono h-[300px] resize-none"
								/>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="swift">
						<div className="py-4 space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="ml-2">{error}</AlertDescription>
								</Alert>
							)}
							<div className="relative">
								<Textarea
									value={code}
									onChange={(e) => {
										setCode(e.target.value);
										setError(null);
									}}
									placeholder={getPlaceholder()}
									className="font-mono h-[300px] resize-none"
								/>
							</div>
						</div>
					</TabsContent>
				</Tabs>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={!code.trim()}>
						Import
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
