"use client";

import { Button } from "@proxed/ui/components/button";
import { Calendar } from "@proxed/ui/components/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@proxed/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@proxed/ui/components/select";
import { formatISO } from "date-fns";
import { subMonths, subWeeks } from "date-fns";
import { formatDateRange } from "little-date";
import { ChevronDownIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";
import { changeChartPeriodAction } from "@/actions/change-chart-period-action";

type Props = {
	defaultValue: {
		to: string;
		from: string;
	};
	disabled?: string;
};

const periods = [
	{
		value: "1w",
		label: "Last 1 week",
		range: {
			from: subWeeks(new Date(), 1),
			to: new Date(),
		},
	},
	{
		value: "4w",
		label: "Last 4 weeks",
		range: {
			from: subWeeks(new Date(), 4),
			to: new Date(),
		},
	},
	{
		value: "3m",
		label: "Last 3 months",
		range: {
			from: subMonths(new Date(), 3),
			to: new Date(),
		},
	},
];
export function ChartPeriod({ defaultValue, disabled }: Props) {
	const { execute } = useAction(changeChartPeriodAction);

	const [params, setParams] = useQueryStates(
		{
			from: parseAsString.withDefault(defaultValue.from),
			to: parseAsString.withDefault(defaultValue.to),
			period: parseAsString,
		},
		{
			shallow: false,
		},
	);

	const handleChangePeriod = (
		range: { from: Date | null; to: Date | null } | undefined,
		period?: string,
	) => {
		if (!range) return;

		const newRange = {
			from: range.from
				? formatISO(range.from, { representation: "date" })
				: params.from,
			to: range.to
				? formatISO(range.to, { representation: "date" })
				: params.to,
			period,
		};

		setParams(newRange);
		execute(newRange);
	};

	return (
		<div className="flex space-x-4">
			<Popover>
				<PopoverTrigger asChild disabled={Boolean(disabled)}>
					<Button
						variant="default"
						className="justify-start space-x-2 text-left font-medium"
					>
						<span className="line-clamp-1 text-ellipsis">
							{formatDateRange(new Date(params.from), new Date(params.to), {
								includeTime: false,
							})}
						</span>
						<ChevronDownIcon />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="flex w-screen flex-col space-y-4 p-0 md:w-[550px]"
					align="end"
					sideOffset={10}
				>
					<div className="p-4 pb-0">
						<Select
							defaultValue={params.period ?? undefined}
							onValueChange={(value) =>
								handleChangePeriod(
									periods.find((p) => p.value === value)?.range,
									value,
								)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a period" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{periods.map((period) => (
										<SelectItem key={period.value} value={period.value}>
											{period.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<Calendar
						mode="range"
						numberOfMonths={2}
						selected={{
							from: params.from && new Date(params.from),
							to: params.to && new Date(params.to),
						}}
						defaultMonth={
							new Date(new Date().setMonth(new Date().getMonth() - 1))
						}
						initialFocus
						toDate={new Date()}
						// @ts-expect-error
						onSelect={(date) => handleChangePeriod(date)}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
