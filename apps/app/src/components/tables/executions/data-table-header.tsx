"use client";

import { Button } from "@proxed/ui/components/button";
import { TableHead, TableHeader, TableRow } from "@proxed/ui/components/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Props = {
	table?: any;
	loading?: boolean;
};

export function DataTableHeader({ table, loading }: Props) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const sortParam = searchParams.get("sort");
	const [column, value] = sortParam ? sortParam.split(":") : [];

	const createSortQuery = useCallback(
		(name: string) => {
			const params = new URLSearchParams(searchParams);
			const prevSort = params.get("sort");

			if (`${name}:asc` === prevSort) {
				params.set("sort", `${name}:desc`);
			} else if (`${name}:desc` === prevSort) {
				params.delete("sort");
			} else {
				params.set("sort", `${name}:asc`);
			}

			router.replace(`${pathname}?${params.toString()}`);
		},
		[searchParams, router, pathname],
	);

	const isVisible = (id: string) =>
		loading ||
		table
			?.getAllLeafColumns()
			.find((col: any) => col.id === id)
			.getIsVisible();

	const renderSortHeader = (id: string, label: string, minWidth = "110px") =>
		isVisible(id) && (
			<TableHead className={`min-w-[${minWidth}] px-3 py-2 md:px-4`}>
				<Button
					className="space-x-2 p-0 hover:bg-transparent"
					variant="ghost"
					onClick={() => createSortQuery(id)}
				>
					<span>{label}</span>
					{id === column && value === "asc" && <ArrowDown size={16} />}
					{id === column && value === "desc" && <ArrowUp size={16} />}
				</Button>
			</TableHead>
		);

	return (
		<TableHeader>
			<TableRow className="h-[45px] hover:bg-transparent">
				{renderSortHeader("project", "Project", "250px")}
				{renderSortHeader("model", "Model", "150px")}
				{renderSortHeader("provider", "Provider", "100px")}
				{renderSortHeader("totalTokens", "Tokens", "120px")}
				{renderSortHeader("totalCost", "Cost", "120px")}
				{renderSortHeader("finishReason", "Status", "100px")}
				{renderSortHeader("latency", "Latency", "100px")}
				{renderSortHeader("createdAt", "Created At", "150px")}
				{isVisible("actions") && (
					<TableHead className="w-[50px] px-3 py-2 md:px-4" />
				)}
			</TableRow>
		</TableHeader>
	);
}
