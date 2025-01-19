"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface AddFieldDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, schema: JsonSchema) => void;
}

export function AddFieldDialog({ open, onClose, onAdd }: AddFieldDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<JsonSchema["type"]>("string");
  const [description, setDescription] = useState("");

  function handleAdd() {
    const baseSchema: JsonSchema = {
      type,
      optional: false,
      nullable: false,
      description: description || undefined,
    };

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
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., firstName"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as JsonSchema["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="enum">Enum</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
