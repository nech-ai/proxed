"use client";

import { generateExecutionsFilters } from "@/actions/ai/filters/generate-executions-filters";
import { Calendar } from "@proxed/ui/components/calendar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "@proxed/ui/components/dropdown-menu";
import { Input } from "@proxed/ui/components/input";
import { cn } from "@proxed/ui/utils";
import { readStreamableValue } from "ai/rsc";
import { formatISO } from "date-fns";
import {
	CalendarIcon,
	Filter,
	Search,
	ServerIcon,
	ZapIcon,
} from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FilterList } from "./filter-list";
import { Button } from "@proxed/ui/components/button";

type Props = {
	placeholder: string;
	className?: string;
};

const defaultSearch = {
	q: "",
	projectId: "",
	provider: "",
	model: "",
	finishReason: "",
	start: "",
	end: "",
};

const finishReasons = [
	"stop",
	"length",
	"content-filter",
	"tool-calls",
	"error",
	"other",
	"unknown",
] as const;

const models = ["gpt-4o", "gpt-4o-mini", "claude-3-sonnet"] as const;

export function SearchFilter({ placeholder, className }: Props) {
	const [prompt, setPrompt] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const [streaming, setStreaming] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const deviceChecks: { id: string; name: string }[] = [];

	const [filters, setFilters] = useQueryStates(
		{
			q: parseAsString,
			projectId: parseAsString,
			provider: parseAsString,
			model: parseAsString,
			finishReason: parseAsString,
			start: parseAsString,
			end: parseAsString,
		},
		{
			shallow: false,
			history: "push",
		},
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

	const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const value = evt.target.value;

		if (value) {
			setPrompt(value);
		} else {
			setFilters(defaultSearch);
			setPrompt("");
		}
	};

	const handleSubmit = async () => {
		// If the user is typing a query with multiple words, we want to stream the results
		if (prompt.split(" ").length > 1) {
			setStreaming(true);

			const { object } = await generateExecutionsFilters(
				prompt,
				`
        deviceChecks: ${deviceChecks.map((deviceCheck) => deviceCheck.name).join(", ")}
        `,
			);

			let finalObject = {};

			for await (const partialObject of readStreamableValue(object)) {
				if (partialObject) {
					finalObject = {
						...finalObject,
						...partialObject,
						deviceCheck:
							deviceChecks?.find(
								(deviceCheck) =>
									deviceCheck.name === partialObject?.deviceCheck,
							)?.id ?? null,
						q: partialObject?.name ?? null,
					};
				}
			}

			setFilters({
				q: null,
				...finalObject,
			});

			setStreaming(false);
		} else {
			setFilters({ q: prompt.length > 0 ? prompt : null });
		}
	};

	const hasValidFilters =
		Object.entries(filters).filter(
			([key, value]) => value !== null && key !== "q",
		).length > 0;

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<div className="flex items-center space-x-3">
				<form
					className="relative flex-1"
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						ref={inputRef}
						placeholder={placeholder}
						className={cn(
							"h-8 w-full md:w-[300px] pr-10 pl-9",
							"transition-all duration-200",
							"focus-visible:ring-1",
							className,
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
									{
										Object.entries(filters).filter(
											([key, value]) => value !== null && key !== "q",
										).length
									}
								</span>
							)}
						</Button>
					</DropdownMenuTrigger>
				</form>

				<FilterList
					filters={filters}
					loading={streaming}
					onRemove={setFilters}
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
							<ServerIcon className="mr-2 h-4 w-4" />
							<span>Provider</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem
								onClick={() => setFilters({ provider: "OPENAI" })}
							>
								OpenAI
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setFilters({ provider: "ANTHROPIC" })}
							>
								Anthropic
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<ZapIcon className="mr-2 h-4 w-4" />
							<span>Model</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							{models.map((model) => (
								<DropdownMenuItem
									key={model}
									onClick={() => setFilters({ model })}
								>
									{model}
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<ServerIcon className="mr-2 h-4 w-4" />
							<span>Status</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							{finishReasons.map((reason) => (
								<DropdownMenuItem
									key={reason}
									onClick={() => setFilters({ finishReason: reason })}
								>
									{reason}
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
												? formatISO(range.from, { representation: "date" })
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
