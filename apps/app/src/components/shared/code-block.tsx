"use client";

import { Button } from "@proxed/ui/components/button";
import { useToast } from "@proxed/ui/hooks/use-toast";
import { ClipboardCopy } from "lucide-react";

interface CodeBlockProps {
	code: string;
	language?: string; // Optional: if you integrate syntax highlighting
	fileName?: string;
}

/**
 * Basic CodeBlock component for displaying preformatted code.
 * Does not include syntax highlighting for simplicity.
 */
export function CodeBlock({ code, fileName }: CodeBlockProps) {
	const { toast } = useToast();

	const copyToClipboard = () => {
		navigator.clipboard.writeText(code);
		toast({ title: "Copied to clipboard!" });
	};

	return (
		<div className="relative group bg-muted rounded-md overflow-hidden border">
			<div className="flex justify-between items-center px-4 py-1 border-b bg-muted/50">
				<span className="text-xs text-muted-foreground">
					{fileName ?? "Code"}
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity"
					onClick={copyToClipboard}
				>
					<ClipboardCopy className="h-3.5 w-3.5" />
					<span className="sr-only">Copy code</span>
				</Button>
			</div>
			<pre className="p-4 text-sm overflow-x-auto">
				<code>{code}</code>
			</pre>
		</div>
	);
}
