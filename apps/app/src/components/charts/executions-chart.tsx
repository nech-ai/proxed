import { AnimatedNumber } from "@/components/animated-number";
import { FormatAmount } from "@/components/format-amount";
import { getExecutionMetrics } from "@proxed/supabase/cached-queries";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { cn } from "@proxed/ui/utils";
import { InfoIcon } from "lucide-react";
import { BarChart } from "./bar-chart";

type Props = {
	value: any;
	defaultValue: any;
	type: string;
	disabled?: boolean;
};

export async function ExecutionsChart({
	value,
	defaultValue,
	type,
	disabled,
}: Props) {
	const data = await getExecutionMetrics({ ...defaultValue, ...value, type });

	return (
		<div
			className={cn(
				disabled && "pointer-events-none select-none",
				"p-4 sm:p-6",
			)}
		>
			<div className="mb-8 inline-block select-text space-y-2 sm:mb-14">
				<h1 className="font-mono text-3xl sm:text-4xl">
					<AnimatedNumber value={data?.summary?.currentTotal ?? 0} />
				</h1>

				<div className="flex items-center space-x-2 text-[#606060] text-xs sm:text-sm">
					<p className="text-[#606060]">
						vs{" "}
						<FormatAmount
							maximumFractionDigits={0}
							minimumFractionDigits={0}
							amount={data?.summary?.prevTotal ?? 0}
						/>{" "}
						last period
					</p>
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<InfoIcon className="mt-1 h-3 w-3 sm:h-4 sm:w-4" />
							</TooltipTrigger>
							<TooltipContent
								className="max-w-[240px] p-4 text-[#878787] text-xs"
								side="bottom"
								sideOffset={10}
							>
								{type === "all" ? (
									<div className="space-y-2">
										<h3 className="font-medium text-primary">
											All jobs show the total number of jobs created.
										</h3>
										<p>
											Explanation: This shows how many jobs you created in the
											system.
										</p>
									</div>
								) : (
									<div className="space-y-2">
										<h3 className="font-medium text-primary">
											Completed and Failed jobs have the final status.
										</h3>
										<p>
											Explanation: This shows how many jobs you completed or
											failed in the system for the selected period.
										</p>
									</div>
								)}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			<BarChart data={data} disabled={disabled} />
		</div>
	);
}
