import { describe, test, expect } from "bun:test";
import { parseCombinedToken } from "../../utils/token-parser";

describe("parseCombinedToken", () => {
	test("should parse a token with multiple dot-separated parts correctly", () => {
		const token = "part1.part2.part3.tokenValue";
		const { apiKeyPart, tokenPart } = parseCombinedToken(token);
		expect(apiKeyPart).toBe("part1.part2.part3");
		expect(tokenPart).toBe("tokenValue");
	});

	test("should parse a token with one dot correctly", () => {
		const token = "apiKey.tokenValue";
		const { apiKeyPart, tokenPart } = parseCombinedToken(token);
		expect(apiKeyPart).toBe("apiKey");
		expect(tokenPart).toBe("tokenValue");
	});

	test("should return undefined tokenPart if no dot is present", () => {
		const token = "singleValue";
		const { apiKeyPart, tokenPart } = parseCombinedToken(token);
		expect(apiKeyPart).toBe("singleValue");
		expect(tokenPart).toBeUndefined();
	});

	test("should return undefined tokenPart if token ends with a dot", () => {
		const token = "apiKey.";
		const { apiKeyPart, tokenPart } = parseCombinedToken(token);
		// Current implementation behavior, might need adjustment based on desired outcome
		// Based on `lastDotIndex < combinedToken.length - 1`
		expect(apiKeyPart).toBe("apiKey.");
		expect(tokenPart).toBeUndefined();
	});

	test("should return apiKeyPart as empty if token starts with a dot", () => {
		const token = ".tokenValue";
		const { apiKeyPart, tokenPart } = parseCombinedToken(token);
		expect(apiKeyPart).toBe("");
		expect(tokenPart).toBe("tokenValue");
	});

	test("should handle empty string input", () => {
		const token = "";
		const { apiKeyPart, tokenPart } = parseCombinedToken(token);
		expect(apiKeyPart).toBe("");
		expect(tokenPart).toBeUndefined();
	});
});
