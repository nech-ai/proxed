import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
	q: parseAsString,
	page: parseAsInteger.withDefault(0),
	start: parseAsString,
	end: parseAsString,
	bundleId: parseAsString,
	deviceCheck: parseAsString,
});
