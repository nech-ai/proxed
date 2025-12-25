import { ActionBlock } from "@/components/shared/action-block";
import { Card } from "@proxed/ui/components/card";
import { Skeleton } from "@proxed/ui/components/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@proxed/ui/components/tooltip";

interface UsageItemProps {
	label: string;
	current: number;
	max: number | null;
	unit?: string;
	period?: string;
	tooltip?: string;
}

function CircularProgress({ value }: { value: number }) {
	return (
		<div className="relative h-6 w-6 flex items-center justify-center">
			<svg className="h-6 w-6" viewBox="0 0 36 36">
				{/* Background circle */}
				<circle
					className="stroke-muted/25 fill-none"
					cx="18"
					cy="18"
					r="16"
					strokeWidth="4"
				/>
				{/* Progress circle */}
				<circle
					className={`${value >= 90 ? "stroke-destructive" : "stroke-primary"} fill-none transition-all`}
					cx="18"
					cy="18"
					r="16"
					strokeWidth="4"
					strokeDasharray={`${value * 0.01 * 100.53} 100.53`}
					strokeDashoffset="0"
					transform="rotate(-90 18 18)"
				/>
			</svg>
			<span className="absolute text-[10px] font-medium">
				{Math.round(value)}%
			</span>
		</div>
	);
}

function UsageItem({
	label,
	current,
	max,
	unit,
	period,
	tooltip,
}: UsageItemProps) {
	// Calculate percentage if max is not null
	const percentage = max ? Math.min((current / max) * 100, 100) : 0;

	// Format values
	const formattedCurrent =
		current >= 1000
			? `${(current / 1000).toFixed(1)}k`
			: current.toLocaleString();

	const formattedMax =
		max === null
			? "∞"
			: max >= 1000
				? `${(max / 1000).toFixed(1)}k`
				: max.toLocaleString();

	const usageDisplay = (
		<div className="flex items-center justify-between py-3 px-4">
			<div className="flex items-center gap-4">
				<CircularProgress value={percentage} />
				<span className="text-sm font-medium">{label}</span>
			</div>
			<div className="text-sm text-muted-foreground">
				{formattedCurrent}/{formattedMax} {unit}{" "}
				{period && <span>per {period}</span>}
			</div>
		</div>
	);

	if (!tooltip) {
		return usageDisplay;
	}

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="cursor-help">{usageDisplay}</div>
				</TooltipTrigger>
				<TooltipContent side="top" align="center" className="max-w-[300px]">
					<p className="text-xs">{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function Usage({
	data,
	plan,
}: {
	plan: string;
	data: {
		projectsLimit: number | null;
		projectsCount: number;
		apiCallsLimit: number | null;
		apiCallsUsed: number;
		apiCallsRemaining: number;
	};
}) {
	// Check if plan exists and is not free
	const hasPaidPlan = plan && !plan.startsWith("free");

	const projectsTooltip = hasPaidPlan
		? data.projectsLimit
			? `You have used ${data.projectsCount.toLocaleString()} out of ${data.projectsLimit.toLocaleString()} available projects. ${
					data.projectsLimit - data.projectsCount
				} projects remaining.`
			: `You have ${data.projectsCount.toLocaleString()} active projects with unlimited projects available.`
		: "Upgrade to a paid plan to create more projects.";

	const apiCallsTooltip = hasPaidPlan
		? data.apiCallsLimit
			? `You have made ${data.apiCallsUsed.toLocaleString()} API calls this month. ${
					data.apiCallsRemaining > 0
						? `${data.apiCallsRemaining.toLocaleString()} calls remaining.`
						: "You have reached your API calls limit for this month."
				}`
			: `You have made ${data.apiCallsUsed.toLocaleString()} API calls this month with unlimited calls available.`
		: "Upgrade to a paid plan to make API calls.";

	return (
		<ActionBlock title="Usage">
			<Card className="divide-y">
				<UsageItem
					label="Projects"
					current={data.projectsCount}
					max={hasPaidPlan ? data.projectsLimit : 0}
					tooltip={projectsTooltip}
				/>
				<UsageItem
					label="API Calls"
					current={data.apiCallsUsed}
					max={hasPaidPlan ? data.apiCallsLimit : 0}
					period="month"
					tooltip={apiCallsTooltip}
				/>
			</Card>
		</ActionBlock>
	);
}

export function UsageSkeleton() {
	const skeletonItems = ["projects", "api_calls"];

	return (
		<ActionBlock title="Usage">
			<Card className="divide-y">
				{skeletonItems.map((item) => (
					<div
						key={item}
						className="flex items-center justify-between py-3 px-4"
					>
						<div className="flex items-center gap-4">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-24" />
						</div>
						<Skeleton className="h-4 w-20" />
					</div>
				))}
			</Card>
		</ActionBlock>
	);
}
