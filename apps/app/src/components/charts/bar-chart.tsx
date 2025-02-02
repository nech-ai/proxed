"use client";

import { useI18n } from "@/locales/client";
import { useUserContext } from "@/store/user/hook";
import { formatAmount } from "@/utils/format";
import { cn } from "@proxed/ui/utils";
import { format } from "date-fns";
import {
	Bar,
	BarChart as BaseBarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Status } from "./status";

interface ChartDataItem {
	date: string;
	precentage: {
		value: string | number;
		status: string;
	};
	current: { value: string | number; date?: string };
	previous: { value: string | number; date?: string };
}

interface ChartData {
	result: ChartDataItem[] | undefined;
	summary: {
		currentTotal: number;
		prevTotal: number;
	};
	meta: {
		type: "all" | "completed" | "failed";
	};
}

interface BarChartProps {
	data: ChartData | null;
	height?: number;
	disabled?: boolean;
}

const ToolTipContent = ({ payload = [] }: { payload?: any[] }) => {
	const t = useI18n();
	const { locale } = useUserContext((state) => state.data);

	const [current, previous] = payload;

	return (
		<div className="w-[240px] rounded-md border bg-background shadow-sm">
			<div className="flex items-center justify-between border-b-[1px] px-4 py-2">
				<p className="text-sm">
					{/* @ts-ignore */}
					{t(`chart_type.${current?.payload?.meta?.type || "all"}`)}
				</p>
				<div>
					{current?.payload.precentage.value > 0 && (
						<Status
							value={`${current?.payload.precentage.value}%`}
							variant={current?.payload.precentage.status}
						/>
					)}
				</div>
			</div>

			<div className="p-4">
				<div className="mb-2 flex justify-between">
					<div className="flex items-center justify-center space-x-2">
						<div className="h-[8px] w-[8px] rounded-full bg-primary" />
						<p className="font-medium text-[13px]">
							{formatAmount({
								maximumFractionDigits: 0,
								minimumFractionDigits: 0,
								amount: current?.payload?.current.value || 0,
								locale,
							})}
						</p>
					</div>

					<p className="text-right text-[#606060] text-xs">
						{current?.payload?.meta?.period === "weekly"
							? current?.payload?.current?.date &&
								`Week ${format(
									new Date(current.payload.current.date),
									"ww, y",
								)}`
							: current?.payload?.current?.date &&
								format(new Date(current.payload.current.date), "dd MMM, y")}
					</p>
				</div>

				<div className="flex justify-between">
					<div className="flex items-center justify-center space-x-2">
						<div className="h-[8px] w-[8px] rounded-full bg-[#606060] dark:bg-[#A0A0A0]" />
						<p className="font-medium text-[13px]">
							{formatAmount({
								amount: previous?.payload?.previous.value || 0,
								maximumFractionDigits: 0,
								minimumFractionDigits: 0,
								locale,
							})}
						</p>
					</div>

					<p className="text-right text-[#606060] text-xs">
						{previous?.payload?.meta?.period === "weekly"
							? previous?.payload?.previous?.date &&
								`Week ${format(
									new Date(previous.payload.previous.date),
									"ww, y",
								)}`
							: previous?.payload?.previous?.date &&
								format(new Date(previous.payload.previous.date), "dd MMM, y")}
					</p>
				</div>
			</div>
		</div>
	);
};

export function BarChart({ data, height = 290 }: BarChartProps) {
	const formattedData = data?.result?.map((item) => ({
		...item,
		meta: data.meta,
		date: format(new Date(item.date), "dd MMM"),
	}));

	return (
		<div className="relative h-full w-full">
			<div className="-top-10 absolute right-0 hidden space-x-4 md:flex">
				<div className="flex items-center space-x-2">
					<span className="h-2 w-2 rounded-full bg-[#121212] dark:bg-[#F5F5F3]" />
					<span className="text-[#606060] text-sm">Current Period</span>
				</div>
				<div className="flex items-center space-x-2">
					<span className="h-2 w-2 rounded-full bg-[#C6C6C6] dark:bg-[#606060]" />
					<span className="text-[#606060] text-sm">Last Period</span>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={height}>
				<BaseBarChart data={formattedData} barGap={15}>
					<XAxis
						dataKey="date"
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickMargin={15}
						tick={{
							fill: "#606060",
							fontSize: 12,
							fontFamily: "var(--font-sans)",
						}}
					/>

					<YAxis
						stroke="#888888"
						fontSize={12}
						tickMargin={10}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value: number) => Math.floor(value).toString()}
						allowDecimals={false}
						tick={{
							fill: "#606060",
							fontSize: 12,
							fontFamily: "var(--font-sans)",
						}}
					/>

					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
					/>

					<Tooltip content={ToolTipContent} cursor={false} />

					<Bar dataKey="previous.value" barSize={16}>
						{data?.result?.map((entry, index) => (
							<Cell
								key={`cell-${index.toString()}`}
								className={cn("fill-[#606060] dark:fill-[#A0A0A0]")}
							/>
						))}
					</Bar>

					<Bar dataKey="current.value" barSize={16}>
						{data?.result?.map((entry, index) => (
							<Cell
								key={`cell-${index.toString()}`}
								className={cn("fill-primary")}
							/>
						))}
					</Bar>
				</BaseBarChart>
			</ResponsiveContainer>
		</div>
	);
}
