import { mock } from "bun:test";

// console.log("Executing test-preload.ts: Global mocks being applied.");

// Mock server-only
mock.module("server-only", () => {
	// console.log("Preload: Mock for 'server-only' applied.");
	return {};
});

// Mock @proxed/kv
mock.module("@proxed/kv", () => {
	// console.log("Preload: Mock for '@proxed/kv' applied.");
	return {
		client: {
			get: mock(async () => null),
			set: mock(async () => "OK"),
			incr: mock(async () => 1),
			pexpire: mock(async () => 1),
		},
	};
});

// Mock @upstash/ratelimit
// These specific mock function instances will be used by the mocked Ratelimit class
const __mockUpstashLimitMethodForTests = mock().mockResolvedValue({
	success: true,
	remaining: 9,
});
const __mockStaticFixedWindowMethodForTests = mock().mockReturnValue({
	type: "fixedWindowConfig",
});

mock.module("@upstash/ratelimit", () => {
	// console.log("Preload: Mock for '@upstash/ratelimit' applied.");
	const MockedRatelimitClass = mock(function (this: any, options: any) {
		this.limit = __mockUpstashLimitMethodForTests;
		return this; // Explicitly return the instance
	});
	(MockedRatelimitClass as any).fixedWindow =
		__mockStaticFixedWindowMethodForTests;
	return {
		Ratelimit: MockedRatelimitClass,
	};
});

// We are NOT exporting from preload. The test file will import the mocked module
// and access the mock functions from there.
