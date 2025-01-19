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
import { zodCodeToJson } from "@proxed/structure";
import type { JsonSchema } from "@proxed/structure";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@proxed/ui/components/alert";
import { AlertCircle } from "lucide-react";

interface CodeImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (schema: JsonSchema) => void;
}

export function CodeImportDialog({
  open,
  onClose,
  onImport,
}: CodeImportDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      setError(null);
      const result = zodCodeToJson(code);

      if (!result.success) {
        setError(result.error || "Failed to parse schema");
        return;
      }

      onImport(result.data!);
      onClose();
      setCode("");
      toast.success("Schema imported successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to parse schema";
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Zod Schema</DialogTitle>
          <DialogDescription>
            Paste your Zod schema code below. The code should export a Zod
            schema.
          </DialogDescription>
        </DialogHeader>
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
              placeholder={`import { z } from "zod";

export const mySchema = z.object({
  name: z.string(),
  age: z.number(),
  // ...
});`}
              className="font-mono h-[300px] resize-none"
            />
          </div>
        </div>
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
