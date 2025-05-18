import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createAIClient } from "../../utils/ai-client";
import { createError, ErrorCode } from "../../utils/errors";

// Mock the AI SDK client creation functions
const mockCreateOpenAI = mock((): any => ({ type: "openai" }));
const mockCreateAnthropic = mock((): any => ({ type: "anthropic" }));

mock.module("@ai-sdk/openai", () => ({
	createOpenAI: mockCreateOpenAI,
}));

mock.module("@ai-sdk/anthropic", () => ({
	createAnthropic: mockCreateAnthropic,
}));

describe("createAIClient", () => {
	const apiKey = "test-api-key";

	beforeEach(() => {
		mockCreateOpenAI.mockClear();
		mockCreateAnthropic.mockClear();
	});
	test("should throw an error for an unsupported provider", () => {
		const unsupportedProvider = "UNSUPPORTED_PROVIDER" as any;
		expect(() => createAIClient(unsupportedProvider, apiKey)).toThrowError({
			name: "AppError",
			message: `Unsupported AI provider: ${unsupportedProvider}`,
			code: ErrorCode.INTERNAL_ERROR,
		});
		expect(mockCreateOpenAI).not.toHaveBeenCalled();
		expect(mockCreateAnthropic).not.toHaveBeenCalled();
	});
});
