"use client";

import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@proxed/ui/components/select";
import type { LucideIcon } from "lucide-react";

interface Option {
  id: string;
  label: string;
}

interface SelectWithIconProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  icon: LucideIcon;
  placeholder: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectWithIcon({
  value,
  onValueChange,
  options,
  icon: Icon,
  placeholder,
  isLoading,
  disabled,
  className,
}: SelectWithIconProps) {
  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className={cn("relative", className)}>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0" />
            <SelectValue placeholder={placeholder}>
              {selectedOption?.label || placeholder}
            </SelectValue>
            {isLoading && (
              <Loader2Icon className="h-4 w-4 animate-spin ml-2 shrink-0" />
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="min-w-[200px]">
          {options.map((option) => (
            <SelectItem
              key={option.id}
              value={option.id}
              className="flex items-center gap-2 py-2"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
