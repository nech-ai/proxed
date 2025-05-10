import { describe, beforeEach, test, expect, mock } from "bun:test";
import { Hono } from "hono";

// ---------- Shared constants ----------
const TEST_PROJECT_ID = "test-project-id";
const TEST_TEAM_ID = "test-team-id";
const TEST_KEY_ID = "test-key-id";
const TEST_PARTIAL_API_KEY = "pk_client_part";
const TEST_TOKEN = "secret-test-key";
const TEST_BEARER = `${TEST_PARTIAL_API_KEY}.${TEST_TOKEN}`;

// ---------- Global mocks (re-used by all three routers) ----------
// Supabase client
const mockRpc = mock(async () => ({ data: "server", error: null }));
const mockSelectSingle = mock(async () => ({
	data: { notification_threshold: 1000, notification_interval_seconds: 3600 },
	error: null,
}));
const mockFrom = () => ({
	select: () => ({ eq: () => ({ single: mockSelectSingle }) }),
});
const fakeSupabase = { rpc: mockRpc, from: mockFrom } as any;
const mockCreateSupabase = mock(() => fakeSupabase);
mock.module("@proxed/supabase/api", () => ({
	createClient: mockCreateSupabase,
}));

// Queries
const baseProjectRow: any = {
	id: TEST_PROJECT_ID,
	team_id: TEST_TEAM_ID,
	name: "Test Project",
	test_mode: true,
	test_key: TEST_TOKEN,
	key_id: TEST_KEY_ID,
	device_check_id: null,
	model: "gpt-3.5-turbo",
	key: { provider: "OPENAI" },
	system_prompt: "You are a helpful assistant.",
	default_user_prompt: "Hello",
	schema_config: { type: "object", fields: {} },
	notification_threshold: 1000,
	notification_interval_seconds: 3600,
};
const mockGetProject = mock(async () => ({
	data: baseProjectRow,
	error: null,
}));
const mockGetLimits = mock(async () => ({
	data: { api_calls_used: 0, api_calls_limit: 100 },
	error: null,
}));
mock.module("@proxed/supabase/queries", () => ({
	getProjectQuery: mockGetProject,
	getTeamLimitsMetricsQuery: mockGetLimits,
}));

// Mutations
const mockCreateExecution = mock(async () => ({}));
mock.module("@proxed/supabase/mutations", () => ({
	createExecution: mockCreateExecution,
}));

// Partial key util
mock.module("@proxed/utils/lib/partial-keys", () => ({
	reassembleKey: (server: string, client: string) => `${server}.${client}`,
}));

// createAIClient – return dummy model object (generateObject is mocked)
mock.module("../../utils/ai-client", () => ({
	createAIClient: () => () => ({ model: "dummy" }),
}));

// generateObject from ai – just return static data
const generateObjectResult = {
	object: { answer: "ok" },
	usage: { promptTokens: 4, completionTokens: 4 },
	finishReason: "stop",
};
mock.module("ai", () => ({
	generateObject: mock(async () => generateObjectResult),
}));

// ZodParser – no real validation needed
mock.module("@proxed/structure", () => ({
	ZodParser: class {
		convertJsonSchemaToZodValidator() {
			return {};
		}
	},
}));

// Jobs & rate limit util
mock.module("@proxed/jobs", () => ({
	sendHighConsumptionNotification: { trigger: mock(async () => {}) },
}));
mock.module("../../utils/rate-limit", () => ({
	checkAndNotifyRateLimit: () => {},
}));

// ---------- Import routers after mocks ----------
import { pdfResponseRouter } from "../../routes/pdf";
import { textResponseRouter } from "../../routes/text";
import { visionResponseRouter } from "../../routes/vision";

// Helper to build app per route
function buildApp(routerPath: string, router: any) {
	const app = new Hono().basePath("/v1");
	app.route(routerPath, router);
	return app;
}

// ---------- Tests ----------

describe("Structured-response routes", () => {
	beforeEach(() => {
		mockCreateExecution.mockClear();
	});

	test("PDF structured response happy path", async () => {
		const app = buildApp("/pdf", pdfResponseRouter);
		const res = await app.request(`/v1/pdf/${TEST_PROJECT_ID}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${TEST_BEARER}`,
				"x-ai-key": TEST_PARTIAL_API_KEY,
				"content-type": "application/json",
			},
			body: JSON.stringify({ pdf: "data:application/pdf;base64,AA==" }),
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toEqual({ answer: "ok" });
		expect(mockCreateExecution).toHaveBeenCalledTimes(1);
	});

	test("Text structured response happy path", async () => {
		const app = buildApp("/text", textResponseRouter);
		const res = await app.request(`/v1/text/${TEST_PROJECT_ID}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${TEST_BEARER}`,
				"x-ai-key": TEST_PARTIAL_API_KEY,
				"content-type": "application/json",
			},
			body: JSON.stringify({ text: "hello" }),
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ answer: "ok" });
		expect(mockCreateExecution).toHaveBeenCalledTimes(1);
	});

	test("Vision structured response happy path", async () => {
		const app = buildApp("/vision", visionResponseRouter);
		const res = await app.request(`/v1/vision/${TEST_PROJECT_ID}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${TEST_BEARER}`,
				"x-ai-key": TEST_PARTIAL_API_KEY,
				"content-type": "application/json",
			},
			body: JSON.stringify({ image: "data:image/png;base64,AA==" }),
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ answer: "ok" });
		expect(mockCreateExecution).toHaveBeenCalledTimes(1);
	});
});
