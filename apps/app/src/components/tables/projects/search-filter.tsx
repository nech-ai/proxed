"use client";

import { generateProjectsFilters } from "@/actions/ai/filters/generate-projects-filters";
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
} from "@proxed/ui/components/dropdown-menu";
import { Input } from "@proxed/ui/components/input";
import { cn } from "@proxed/ui/utils";
import { readStreamableValue } from "ai/rsc";
import { formatISO } from "date-fns";
import { CalendarIcon, Filter, Search } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FilterList } from "./filter-list";

type Props = {
	placeholder: string;
};

const defaultSearch = {
	name: null,
	deviceCheck: null,
	start: null,
	end: null,
};

export function SearchFilter({ placeholder }: Props) {
	const [prompt, setPrompt] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const [streaming, setStreaming] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const deviceChecks: { id: string; name: string }[] = [];

	const [filters, setFilters] = useQueryStates(
		{
			name: parseAsString,
			q: parseAsString,
			start: parseAsString,
			end: parseAsString,
			deviceCheck: parseAsString,
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

			const { object } = await generateProjectsFilters(
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
			<div className="flex items-center space-x-4">
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
						className="h-10 w-full pr-10 pl-9 transition-all duration-200 focus:ring-2 md:w-[400px]"
						value={prompt}
						onChange={handleSearch}
						autoComplete="off"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck="false"
					/>

					<DropdownMenuTrigger asChild>
						<button
							onClick={() => setIsOpen((prev) => !prev)}
							type="button"
							className={cn(
								"-translate-y-1/2 absolute top-1/2 right-3 z-10 h-4 w-4 text-muted-foreground transition-all duration-200 hover:text-foreground",
								hasValidFilters && "text-foreground",
								isOpen && "text-foreground",
							)}
						>
							<Filter className="h-4 w-4" />
						</button>
					</DropdownMenuTrigger>
				</form>

				<FilterList
					filters={filters}
					loading={streaming}
					onRemove={setFilters}
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
							<CalendarIcon className="mr-2 h-4 w-4" />
							<span>Created At</span>
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
									// @ts-expect-error
									selected={{
										from: filters.start && new Date(filters.start),
										to: filters.end && new Date(filters.end),
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
