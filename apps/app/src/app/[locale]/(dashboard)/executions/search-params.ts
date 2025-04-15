import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
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
		"claude-3-7-sonnet-latest",
		"gpt-4.1",
		"gpt-4.1-mini",
		"gpt-4.1-nano",
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
});
