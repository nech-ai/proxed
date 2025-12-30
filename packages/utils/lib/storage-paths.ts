export type StoragePathValidationResult = {
	normalized: string;
	decodedSegments: string[];
};

export type StoragePathValidationOptions = {
	prefix?: string;
};

export function decodePathSegment(segment: string): string | null {
	try {
		return decodeURIComponent(segment);
	} catch {
		return null;
	}
}

function normalizeStoragePath(path: string, prefix?: string) {
	const trimmed = path.replace(/^\/+/, "");
	if (!prefix) return trimmed;
	const cleanedPrefix = prefix.replace(/^\/+|\/+$/g, "");
	if (!cleanedPrefix) return trimmed;
	if (trimmed === cleanedPrefix) return "";
	if (trimmed.startsWith(`${cleanedPrefix}/`)) {
		return trimmed.slice(cleanedPrefix.length + 1);
	}
	return trimmed;
}

export function normalizeAndValidateStoragePath(
	path: string,
	options: StoragePathValidationOptions = {},
): StoragePathValidationResult | null {
	if (!path) return null;
	const normalized = normalizeStoragePath(path, options.prefix);

	if (!normalized || normalized.includes("\\") || normalized.includes("\0")) {
		return null;
	}

	const segments = normalized.split("/");
	const decodedSegments: string[] = [];

	for (const segment of segments) {
		if (!segment || segment === "." || segment === "..") {
			return null;
		}

		const decoded = decodePathSegment(segment);
		if (!decoded) return null;

		if (
			decoded === "." ||
			decoded === ".." ||
			decoded.includes("/") ||
			decoded.includes("\\") ||
			decoded.includes("\0")
		) {
			return null;
		}

		decodedSegments.push(decoded);
	}

	return { normalized, decodedSegments };
}
