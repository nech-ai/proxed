import { formatISO, subWeeks } from "date-fns";
import { useQueryStates } from "nuqs";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const chartTypeOptions = ["all", "tokens"] as const;

const defaultFrom = formatISO(subWeeks(new Date(), 1), {
	representation: "date",
});
const defaultTo = formatISO(new Date(), { representation: "date" });

export const metricsParamsSchema = {
	from: parseAsString.withDefault(defaultFrom),
	to: parseAsString.withDefault(defaultTo),
	period: parseAsStringLiteral(["1w", "4w", "3m"]).withDefault("1w"),
	chart: parseAsStringLiteral(chartTypeOptions).withDefault("all"),
};

export function useMetricsParams() {
	const [params, setParams] = useQueryStates(metricsParamsSchema);

	return { params, setParams };
}

export const loadMetricsParams = createLoader(metricsParamsSchema);
