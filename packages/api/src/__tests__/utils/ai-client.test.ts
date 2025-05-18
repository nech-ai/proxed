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

	test("should return OpenAI client for OPENAI provider", () => {
		const client = createAIClient("OPENAI", apiKey);
		expect(client).toEqual({ type: "openai" } as any);
		expect(mockCreateOpenAI).toHaveBeenCalledWith({ apiKey });
		expect(mockCreateAnthropic).not.toHaveBeenCalled();
	});

	test("should return Anthropic client for ANTHROPIC provider", () => {
		const client = createAIClient("ANTHROPIC", apiKey);
		expect(client).toEqual({ type: "anthropic" } as any);
		expect(mockCreateAnthropic).toHaveBeenCalledWith({ apiKey });
		expect(mockCreateOpenAI).not.toHaveBeenCalled();
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
