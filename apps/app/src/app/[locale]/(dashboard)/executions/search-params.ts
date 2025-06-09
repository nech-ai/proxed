import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";
import {
	PROVIDER_VALUES,
	MODEL_VALUES,
	FINISH_REASONS,
	type ProviderValue,
} from "@proxed/utils/lib/providers";

export const searchParamsCache = createSearchParamsCache({
	q: parseAsString,
	page: parseAsInteger.withDefault(0),
	sort: parseAsString,
	start: parseAsString,
	end: parseAsString,
	projectId: parseAsString,
	provider: parseAsStringLiteral(PROVIDER_VALUES),
	model: parseAsStringLiteral(MODEL_VALUES),
	finishReason: parseAsStringLiteral(FINISH_REASONS),
	deviceCheckId: parseAsString,
	keyId: parseAsString,
});
