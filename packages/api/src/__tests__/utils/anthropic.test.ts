import { describe, test, expect } from "bun:test";
import { mapAnthropicFinishReason } from "../../utils/anthropic";
import type { FinishReason } from "../../types";

describe("mapAnthropicFinishReason", () => {
	const testCases: Array<{
		input: string | null | undefined;
		expected: FinishReason;
	}> = [
		{ input: "end_turn", expected: "stop" },
		{ input: "max_tokens", expected: "length" },
		{ input: "tool_use", expected: "tool-calls" },
		{ input: "stop_sequence", expected: "stop" },
		{
			input: "some_other_reason",
			expected: "some_other_reason" as FinishReason,
		},
		{ input: null, expected: "unknown" },
		{ input: undefined, expected: "unknown" },
		{ input: "", expected: "unknown" }, // Empty string treated as unknown
	];

	testCases.forEach(({ input, expected }) => {
		test(`should map '${input}' to '${expected}'`, () => {
			expect(mapAnthropicFinishReason(input)).toBe(expected);
		});
	});

	test("should log unmapped reasons (if logger was active and asserted)", () => {
		// Similar to OpenAI, this is conceptual for now regarding logger assertion.
		const unmappedReason = "new_anthropic_reason";
		const result = mapAnthropicFinishReason(unmappedReason);
		expect(result).toBe(unmappedReason as FinishReason);
		// If logger was mocked: expect(logger.info).toHaveBeenCalledWith(`Unmapped Anthropic finish reason: ${unmappedReason}`);
	});
});
