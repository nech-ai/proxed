"use client";
import { Skeleton } from "@proxed/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@proxed/ui/components/table";
import { cn } from "@proxed/ui/utils";
import { DataTableHeader } from "./data-table-header";

const data = [...Array(10)].map((_, i) => ({ id: i.toString() }));

export function Loading({ isEmpty }: { isEmpty?: boolean }) {
	return (
		<div className="rounded-md border">
			<Table
				className={cn(isEmpty && "pointer-events-none opacity-20 blur-[7px]")}
			>
				<DataTableHeader loading />
				<TableBody>
					{data?.map((row) => (
						<TableRow key={row.id} className="group h-[45px]">
							{/* Project */}
							<TableCell className="w-[250px]">
								<div className="space-y-2">
									<Skeleton
										className={cn("h-3.5 w-[60%]", isEmpty && "animate-none")}
									/>
									<Skeleton
										className={cn("h-3 w-[40%]", isEmpty && "animate-none")}
									/>
								</div>
							</TableCell>

							{/* Model */}
							<TableCell className="w-[150px]">
								<Skeleton
									className={cn(
										"h-5 w-[80px] rounded-full",
										isEmpty && "animate-none",
									)}
								/>
							</TableCell>

							{/* Provider */}
							<TableCell className="w-[100px]">
								<Skeleton
									className={cn(
										"h-5 w-[60px] rounded-full",
										isEmpty && "animate-none",
									)}
								/>
							</TableCell>

							{/* Tokens */}
							<TableCell className="w-[120px]">
								<div className="space-y-2">
									<Skeleton
										className={cn("h-3.5 w-[50%]", isEmpty && "animate-none")}
									/>
									<Skeleton
										className={cn("h-3 w-[70%]", isEmpty && "animate-none")}
									/>
								</div>
							</TableCell>

							{/* Cost */}
							<TableCell className="w-[120px]">
								<div className="space-y-2">
									<Skeleton
										className={cn("h-3.5 w-[50%]", isEmpty && "animate-none")}
									/>
									<Skeleton
										className={cn("h-3 w-[70%]", isEmpty && "animate-none")}
									/>
								</div>
							</TableCell>

							{/* Status */}
							<TableCell className="w-[100px]">
								<Skeleton
									className={cn(
										"h-5 w-[60px] rounded-full",
										isEmpty && "animate-none",
									)}
								/>
							</TableCell>

							{/* Latency */}
							<TableCell className="w-[100px]">
								<Skeleton
									className={cn("h-3.5 w-[50px]", isEmpty && "animate-none")}
								/>
							</TableCell>

							{/* Created At */}
							<TableCell className="w-[150px]">
								<Skeleton
									className={cn("h-3.5 w-[80px]", isEmpty && "animate-none")}
								/>
							</TableCell>

							{/* Actions */}
							<TableCell className="w-[50px]">
								<Skeleton
									className={cn(
										"h-[20px] w-[20px] rounded-full",
										isEmpty && "animate-none",
									)}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
