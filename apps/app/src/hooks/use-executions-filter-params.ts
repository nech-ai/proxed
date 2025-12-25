import { useQueryStates } from "nuqs";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";
import {
	FINISH_REASONS,
	MODEL_VALUES,
	PROVIDER_VALUES,
} from "@proxed/utils/lib/providers";

export const executionsFilterParamsSchema = {
	q: parseAsString,
	start: parseAsString,
	end: parseAsString,
	projectId: parseAsString,
	provider: parseAsStringLiteral(PROVIDER_VALUES),
	model: parseAsStringLiteral(MODEL_VALUES),
	finishReason: parseAsStringLiteral(FINISH_REASONS),
	deviceCheckId: parseAsString,
	keyId: parseAsString,
};

export function useExecutionsFilterParams() {
	const [filter, setFilter] = useQueryStates(executionsFilterParamsSchema);

	const hasFilters = Object.values({
		start: filter.start,
		end: filter.end,
		projectId: filter.projectId,
		provider: filter.provider,
		model: filter.model,
		finishReason: filter.finishReason,
		deviceCheckId: filter.deviceCheckId,
		keyId: filter.keyId,
	}).some((value) => value !== null);

	return { filter, setFilter, hasFilters };
}

export const loadExecutionsFilterParams = createLoader(
	executionsFilterParamsSchema,
);
