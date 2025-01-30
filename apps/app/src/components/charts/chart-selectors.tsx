import { ChartPeriod } from "@/components/charts/chart-period";
import { ChartType } from "@/components/charts/chart-type";
import { Cookies } from "@/utils/constants";
import { cookies } from "next/headers";

export async function ChartSelectors({ defaultValue }: { defaultValue: any }) {
	const cookieStore = await cookies();
	const chartType = cookieStore.get(Cookies.ChartType)?.value ?? "all";

	return (
		<div className="mt-6 flex justify-between space-x-2">
			<div className="flex space-x-2">
				<ChartType initialValue={chartType} />
			</div>

			<div className="flex space-x-2">
				<ChartPeriod defaultValue={defaultValue} />
			</div>
		</div>
	);
}
