"use client";

import { Calendar } from "@proxed/ui/components/calendar";
import { Button } from "@proxed/ui/components/button";
import { Input } from "@proxed/ui/components/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@proxed/ui/components/dropdown-menu";
import { cn } from "@proxed/ui/utils";
import { formatISO } from "date-fns";
import { CalendarIcon, Filter, Folder, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useQuery } from "@tanstack/react-query";
import { useVaultFilterParams } from "@/hooks/use-vault-filter-params";
import { useTRPC } from "@/trpc/client";
import { VaultFilterList } from "./vault-filter-list";

type VaultFiltersState = ReturnType<typeof useVaultFilterParams>["filter"];

const defaultSearch: VaultFiltersState = {
	q: null,
	projectId: null,
	start: null,
	end: null,
};

export function VaultFilters() {
	const trpc = useTRPC();
	const { filter: filters, setFilter: setFilters } = useVaultFilterParams();
	const inputRef = useRef<HTMLInputElement>(null);
	const [prompt, setPrompt] = useState(filters.q ?? "");
	const [isOpen, setIsOpen] = useState(false);

	const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery(
		trpc.projects.list.queryOptions({ pageSize: 200 }),
	);

	const projects = projectsResponse?.data ?? [];
	const projectLookup = useMemo(
		() =>
			Object.fromEntries(
				projects.map((project) => [project.id, project.name] as const),
			),
		[projects],
	);

	useHotkeys(
		"esc",
		() => {
			setPrompt("");
			setFilters(defaultSearch);
			setIsOpen(false);
		},
		{
			enableOnFormTags: true,
			enabled: Boolean(prompt),
		},
	);

	useHotkeys("meta+s", (evt) => {
		evt.preventDefault();
		inputRef.current?.focus();
	});

	useHotkeys("meta+f", (evt) => {
		evt.preventDefault();
		setIsOpen((prev) => !prev);
	});

	useEffect(() => {
		setPrompt(filters.q ?? "");
	}, [filters.q]);

	const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const value = evt.target.value;

		if (value) {
			setPrompt(value);
		} else {
			setFilters(defaultSearch);
			setPrompt("");
		}
	};

	const handleSubmit = () => {
		setFilters({ q: prompt.length > 0 ? prompt : null });
	};

	const filterCount = Object.entries(filters).filter(
		([key, value]) => value !== null && key !== "q",
	).length;

	const hasValidFilters = filterCount > 0;

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<div className="flex items-center space-x-3">
				<form
					className="relative flex-1"
					onSubmit={(event) => {
						event.preventDefault();
						handleSubmit();
					}}
				>
					<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						ref={inputRef}
						placeholder="Search vault..."
						className={cn(
							"h-8 w-full md:w-[300px] pr-10 pl-9",
							"transition-all duration-200",
							"focus-visible:ring-1",
						)}
						value={prompt}
						onChange={handleSearch}
						autoComplete="off"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck="false"
					/>

					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className={cn(
								"absolute right-0 top-0 h-8 w-8 p-0",
								"hover:bg-transparent",
								hasValidFilters && "text-foreground",
								isOpen && "text-foreground",
							)}
						>
							<Filter className="h-4 w-4" />
							{hasValidFilters && (
								<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
									{filterCount}
								</span>
							)}
						</Button>
					</DropdownMenuTrigger>
				</form>

				<VaultFilterList
					filters={filters}
					loading={isLoadingProjects}
					onRemove={setFilters}
					projectLookup={projectLookup}
					className="hidden md:flex"
				/>
			</div>

			<DropdownMenuContent
				className="w-[400px] p-4"
				align="end"
				sideOffset={19}
				alignOffset={-11}
				side="bottom"
			>
				<DropdownMenuGroup className="space-y-2">
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Folder className="mr-2 h-4 w-4" />
							<span>Project</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="max-h-64 overflow-auto">
							<DropdownMenuItem onClick={() => setFilters({ projectId: null })}>
								All projects
							</DropdownMenuItem>
							{projects.map((project) => (
								<DropdownMenuItem
									key={project.id}
									onClick={() => setFilters({ projectId: project.id })}
								>
									{project.name}
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<CalendarIcon className="mr-2 h-4 w-4" />
							<span>Date Range</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent
								sideOffset={8}
								alignOffset={-4}
								className="p-2"
							>
								<Calendar
									mode="range"
									className="rounded-lg border shadow-sm"
									hidden={{
										before: new Date("1900-01-01"),
										after: new Date(),
									}}
									showOutsideDays={false}
									selected={{
										from: filters.start ? new Date(filters.start) : undefined,
										to: filters.end ? new Date(filters.end) : undefined,
									}}
									onSelect={(range) => {
										if (!range) return;

										const newRange = {
											start: range.from
												? formatISO(range.from, {
														representation: "date",
													})
												: filters.start,
											end: range.to
												? formatISO(range.to, { representation: "date" })
												: filters.end,
										};

										setFilters(newRange);
									}}
									disabled={(date) =>
										date > new Date() || date < new Date("1900-01-01")
									}
								/>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
