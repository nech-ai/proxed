import { ChartPeriod } from "@/components/charts/chart-period";
import { ChartType } from "@/components/charts/chart-type";

export function ChartSelectors() {
	return (
		<div className="mt-6 flex justify-between space-x-2">
			<div className="flex space-x-2">
				<ChartType />
			</div>

			<div className="flex space-x-2">
				<ChartPeriod />
			</div>
		</div>
	);
}
