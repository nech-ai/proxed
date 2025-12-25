import { useQueryStates } from "nuqs";
import { createLoader, parseAsString } from "nuqs/server";

export const projectsFilterParamsSchema = {
	q: parseAsString,
	name: parseAsString,
	start: parseAsString,
	end: parseAsString,
	bundleId: parseAsString,
	deviceCheck: parseAsString,
	keyId: parseAsString,
};

export function useProjectsFilterParams() {
	const [filter, setFilter] = useQueryStates(projectsFilterParamsSchema);

	const hasFilters = Object.values({
		start: filter.start,
		end: filter.end,
		bundleId: filter.bundleId,
		deviceCheck: filter.deviceCheck,
		keyId: filter.keyId,
	}).some((value) => value !== null);

	return { filter, setFilter, hasFilters };
}

export const loadProjectsFilterParams = createLoader(
	projectsFilterParamsSchema,
);
