import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
	createLoader,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
	q: parseAsString,
	page: parseAsInteger.withDefault(0),
	sort: parseAsString,
	start: parseAsString,
	end: parseAsString,
	bundleId: parseAsString,
	deviceCheck: parseAsString,
	keyId: parseAsString,
});
