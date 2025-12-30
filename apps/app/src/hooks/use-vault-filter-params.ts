import { useQueryStates } from "nuqs";
import { createLoader, parseAsString } from "nuqs/server";

export const vaultFilterParamsSchema = {
	q: parseAsString,
	start: parseAsString,
	end: parseAsString,
	projectId: parseAsString,
};

export function useVaultFilterParams() {
	const [filter, setFilter] = useQueryStates(vaultFilterParamsSchema);

	const hasFilters = Object.values({
		q: filter.q,
		start: filter.start,
		end: filter.end,
		projectId: filter.projectId,
	}).some((value) => value !== null);

	return { filter, setFilter, hasFilters };
}

export const loadVaultFilterParams = createLoader(vaultFilterParamsSchema);
