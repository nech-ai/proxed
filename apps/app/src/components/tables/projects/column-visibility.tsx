"use client";
import { useProjectsStore } from "@/store/projects";
import { Button } from "@proxed/ui/components/button";
import { Checkbox } from "@proxed/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@proxed/ui/components/popover";
import { Settings2Icon } from "lucide-react";
export function ColumnVisibility({ disabled }: { disabled?: boolean }) {
  const { columns } = useProjectsStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="default" size="icon" disabled={disabled}>
          <Settings2Icon size={18} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="end" sideOffset={8}>
        <div className="flex max-h-[352px] flex-col space-y-2 overflow-auto p-4">
          {columns
            .filter(
              (column) =>
                column.columnDef.enableHiding !== false &&
                column.id !== "actions",
            )
            .map((column) => {
              return (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) => {
                      // @ts-expect-error
                      column.toggleVisibility(checked);
                    }}
                  />
                  <label
                    htmlFor={column.id}
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {/* @ts-expect-error */}
                    {column.columnDef.header}
                  </label>
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
