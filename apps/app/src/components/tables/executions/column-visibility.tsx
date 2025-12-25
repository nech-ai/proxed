"use client";
import { useExecutionsStore } from "@/store/executions";
import { Button } from "@proxed/ui/components/button";
import { Checkbox } from "@proxed/ui/components/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@proxed/ui/components/popover";
import { Separator } from "@proxed/ui/components/separator";
import { Settings2Icon } from "lucide-react";
import { cn } from "@proxed/ui/utils";

export function ColumnVisibility({
	disabled,
	className,
}: {
	disabled?: boolean;
	className?: string;
}) {
	const { columns } = useExecutionsStore();

	const visibleColumnsCount = columns.filter((column) =>
		column.getIsVisible(),
	).length;
	const totalColumns = columns.filter(
		(column) =>
			column.columnDef.enableHiding !== false && column.id !== "actions",
	).length;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					disabled={disabled}
					className={cn(
						"h-8 gap-2 px-3 lg:px-3",
						disabled && "opacity-50",
						className,
					)}
				>
					<Settings2Icon className="h-4 w-4" />
					<span className="hidden lg:inline-flex">Columns</span>
					<span className="inline-flex lg:hidden">
						{visibleColumnsCount}/{totalColumns}
					</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-[240px] p-0" align="end" sideOffset={8}>
				<div className="p-3 pb-2">
					<h4 className="font-medium">Toggle columns</h4>
					<p className="text-sm text-muted-foreground">
						Select the columns you want to display
					</p>
				</div>
				<Separator />
				<div className="flex max-h-[400px] flex-col overflow-auto p-3">
					<div className="space-y-2">
						{columns
							.filter(
								(column) =>
									column.columnDef.enableHiding !== false &&
									column.id !== "actions",
							)
							.map((column) => {
								return (
									<label
										key={column.id}
										htmlFor={column.id}
										className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50"
									>
										<Checkbox
											id={column.id}
											checked={column.getIsVisible()}
											onCheckedChange={(checked) => {
												column.toggleVisibility?.(!!checked);
											}}
											className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
										/>
										<span className="text-sm">
											{/* @ts-expect-error */}
											{column.columnDef.header}
										</span>
									</label>
								);
							})}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
