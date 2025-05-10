import { describe, test, expect } from "bun:test";
import { mapOpenAIFinishReason } from "../../utils/openai";
import type { FinishReason } from "../../types";

describe("mapOpenAIFinishReason", () => {
	const testCases: Array<{
		input: string | undefined;
		expected: FinishReason;
	}> = [
		{ input: "stop", expected: "stop" },
		{ input: "length", expected: "length" },
		{ input: "content_filter", expected: "content-filter" },
		{ input: "function_call", expected: "tool-calls" }, // Older naming
		{ input: "tool_calls", expected: "tool-calls" }, // Current naming
		{
			input: "some_other_reason",
			expected: "some_other_reason" as FinishReason,
		}, // Should pass through unknown reasons
		{ input: undefined, expected: "unknown" },
		{ input: "", expected: "unknown" }, // Empty string treated as unknown
	];

	testCases.forEach(({ input, expected }) => {
		test(`should map '${input}' to '${expected}'`, () => {
			// Logger mock is not strictly necessary here as we are just checking the return value,
			// but if mapOpenAIFinishReason had side effects with logger, we'd mock it.
			// For now, assuming logger.info in it is fine for a test run.
			expect(mapOpenAIFinishReason(input)).toBe(expected);
		});
	});

	test("should log unmapped reasons (if logger was active and asserted)", () => {
		// This test is more conceptual for now, as asserting logger calls requires more setup.
		// If mapOpenAIFinishReason did: if (isUnmapped) logger.info(...)
		// We would mock logger and expect it to have been called.
		// For now, we just ensure the function doesn't break and returns the input.
		const unmappedReason = "completely_new_reason_from_openai";
		const result = mapOpenAIFinishReason(unmappedReason);
		expect(result).toBe(unmappedReason as FinishReason);
		// If logger was mocked: expect(logger.info).toHaveBeenCalledWith(`Unmapped OpenAI finish reason: ${unmappedReason}`);
	});
});
