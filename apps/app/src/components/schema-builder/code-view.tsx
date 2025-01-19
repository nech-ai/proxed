"use client";

import { useState, useEffect } from "react";
import { Button } from "@proxed/ui/components/button";
import { CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";
import { cn } from "@proxed/ui/utils";

interface CodeViewProps {
  code: string;
}

export function CodeView({ code }: CodeViewProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="relative">
      <pre
        className={cn(
          "p-4 rounded-lg font-mono text-sm overflow-auto",
          "bg-background border-border",
          "border shadow-sm",
          "[&>code]:bg-transparent [&>code]:p-0",
          "scrollbar-thin scrollbar-track-background scrollbar-thumb-muted-foreground/20",
        )}
      >
        <code className="language-typescript">{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "absolute top-2 right-2",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors",
        )}
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {isCopied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
