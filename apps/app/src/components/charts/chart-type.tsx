"use client";

import { useMetricsParams, chartTypeOptions } from "@/hooks/use-metrics-params";
import { useI18n } from "@/locales/client";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
} from "@proxed/ui/components/select";

type Props = {
	disabled?: boolean;
};

export function ChartType({ disabled }: Props) {
	const t = useI18n();
	const { params, setParams } = useMetricsParams();

	return (
		<Select
			value={params.chart}
			onValueChange={(value) =>
				setParams({
					...params,
					chart: value as NonNullable<typeof params.chart>,
				})
			}
		>
			<SelectTrigger
				className="flex-1 space-x-1 font-medium"
				disabled={disabled}
			>
				{/* @ts-expect-error */}
				<span>{t(`chart_type.${params.chart}`)}</span>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{chartTypeOptions.map((option) => {
						return (
							<SelectItem key={option} value={option}>
								{/* @ts-expect-error */}
								{t(`chart_type.${option}`)}
							</SelectItem>
						);
					})}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
