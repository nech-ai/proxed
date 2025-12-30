import { describe, expect, test } from "bun:test";
import {
	decodePathSegment,
	normalizeAndValidateStoragePath,
} from "../storage-paths";

describe("storage path utilities", () => {
	test("decodePathSegment returns decoded value", () => {
		expect(decodePathSegment("team%20id")).toBe("team id");
	});

	test("decodePathSegment returns null on bad encoding", () => {
		expect(decodePathSegment("%E0%A4%A")).toBeNull();
	});

	test("validates and normalizes vault paths", () => {
		const result = normalizeAndValidateStoragePath(
			"vault/team-123/2025/12/30/file.png",
			{ prefix: "vault" },
		);
		expect(result).not.toBeNull();
		expect(result?.normalized).toBe("team-123/2025/12/30/file.png");
		expect(result?.decodedSegments[0]).toBe("team-123");
	});

	test("accepts paths without prefix", () => {
		const result = normalizeAndValidateStoragePath(
			"team-123/2025/12/30/file.png",
			{ prefix: "vault" },
		);
		expect(result?.normalized).toBe("team-123/2025/12/30/file.png");
	});

	test("rejects traversal segments", () => {
		expect(
			normalizeAndValidateStoragePath("team-123/../team-999/file.png", {
				prefix: "vault",
			}),
		).toBeNull();
	});

	test("rejects encoded traversal segments", () => {
		expect(
			normalizeAndValidateStoragePath("team-123/%2e%2e/team-999/file.png", {
				prefix: "vault",
			}),
		).toBeNull();
	});

	test("rejects encoded slashes", () => {
		expect(
			normalizeAndValidateStoragePath("team-123/%2Fteam-999/file.png", {
				prefix: "vault",
			}),
		).toBeNull();
	});

	test("rejects empty segments", () => {
		expect(
			normalizeAndValidateStoragePath("team-123//file.png", {
				prefix: "vault",
			}),
		).toBeNull();
	});
});
