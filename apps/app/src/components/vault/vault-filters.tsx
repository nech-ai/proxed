"use client";

import { Button } from "@proxed/ui/components/button";
import { Input } from "@proxed/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import { Search, XCircle } from "lucide-react";
import { useVaultFilterParams } from "@/hooks/use-vault-filter-params";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function VaultFilters() {
	const trpc = useTRPC();
	const { filter, setFilter } = useVaultFilterParams();

	const { data: projectsResponse } = useQuery(
		trpc.projects.list.queryOptions({ pageSize: 200 }),
	);

	const projects = projectsResponse?.data ?? [];

	return (
		<div className="flex flex-col gap-3 md:flex-row md:items-end">
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search vault..."
					value={filter.q ?? ""}
					onChange={(event) =>
						setFilter({ q: event.target.value || null })
					}
					className="pl-9"
				/>
			</div>

			<div className="w-full md:w-64">
				<Select
					value={filter.projectId ?? "all"}
					onValueChange={(value) =>
						setFilter({ projectId: value === "all" ? null : value })
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="All projects" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All projects</SelectItem>
						{projects.map((project) => (
							<SelectItem key={project.id} value={project.id}>
								{project.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-3">
				<Input
					type="date"
					value={filter.start ?? ""}
					onChange={(event) =>
						setFilter({ start: event.target.value || null })
					}
					className="w-full md:w-40"
				/>
				<Input
					type="date"
					value={filter.end ?? ""}
					onChange={(event) =>
						setFilter({ end: event.target.value || null })
					}
					className="w-full md:w-40"
				/>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={() =>
					setFilter({
						q: null,
						projectId: null,
						start: null,
						end: null,
					})
				}
			>
				<XCircle className="size-4" />
			</Button>
		</div>
	);
}
