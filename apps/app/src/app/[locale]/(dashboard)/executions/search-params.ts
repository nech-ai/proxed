import {
	createLoader,
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";

export const searchParamsMap = {
	q: parseAsString,
	page: parseAsInteger.withDefault(0),
	sort: parseAsString,
	start: parseAsString,
	end: parseAsString,
	projectId: parseAsString,
	provider: parseAsStringLiteral(["OPENAI", "ANTHROPIC"] as const),
	model: parseAsStringLiteral([
		"gpt-4o",
		"gpt-4o-mini",
		"claude-3-sonnet",
	] as const),
	finishReason: parseAsStringLiteral([
		"stop",
		"length",
		"content-filter",
		"tool-calls",
		"error",
		"other",
		"unknown",
	] as const),
	deviceCheckId: parseAsString,
	keyId: parseAsString,
};

export const searchParamsLoader = createLoader(searchParamsMap);
