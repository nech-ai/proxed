import { describe, beforeEach, test, expect, mock } from "bun:test";
import { Hono } from "hono";

// ---------- Shared constants ----------
const TEST_PROJECT_ID = "test-project-id";
const TEST_TEAM_ID = "test-team-id";
const TEST_KEY_ID = "test-key-id";
const TEST_PARTIAL_API_KEY = "pk_client_part";
const TEST_FULL_API_KEY = `${TEST_PARTIAL_API_KEY}.server`; // server part will be re-assembled
const TEST_TOKEN = "secret-test-key";
const TEST_BEARER = `${TEST_PARTIAL_API_KEY}.${TEST_TOKEN}`;

// ---------- Module mocks ----------
//   hono/proxy – don't actually call OpenAI
const mockProxy = mock(
	async () =>
		new Response(
			JSON.stringify({
				id: "cmpl-123",
				usage: {
					prompt_tokens: 3,
					completion_tokens: 7,
					total_tokens: 10,
				},
				choices: [{ finish_reason: "stop" }],
			}),
			{ status: 200 },
		),
);
mock.module("hono/proxy", () => ({ proxy: mockProxy }));

//   Supabase client factory – returns a minimal fake client
const mockRpc = mock(async () => ({ data: "server", error: null }));
const mockSelectSingle = mock(async () => ({
	data: {
		notification_threshold: 1000,
		notification_interval_seconds: 3600,
	},
	error: null,
}));
const mockFrom = () => ({
	select: () => ({
		eq: () => ({ single: mockSelectSingle }),
	}),
});
const fakeSupabase = { rpc: mockRpc, from: mockFrom } as any;
const mockCreateSupabase = mock(() => fakeSupabase);
mock.module("@proxed/supabase/api", () => ({
	createClient: mockCreateSupabase,
}));

//   Queries
const projectRow: any = {
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
const mockGetProject = mock(async () => ({ data: projectRow, error: null }));
const mockGetLimits = mock(async () => ({
	data: { api_calls_used: 0, api_calls_limit: 100 },
	error: null,
}));
mock.module("@proxed/supabase/queries", () => ({
	getProjectQuery: mockGetProject,
	getTeamLimitsMetricsQuery: mockGetLimits,
}));

//   Mutations
const mockCreateExecution = mock(async () => ({}));
mock.module("@proxed/supabase/mutations", () => ({
	createExecution: mockCreateExecution,
}));

//   Partial-key utils
mock.module("@proxed/utils/lib/partial-keys", () => ({
	reassembleKey: (server: string, client: string) => `${server}.${client}`,
}));

//   Jobs / notification – no-op
mock.module("@proxed/jobs", () => ({
	sendHighConsumptionNotification: { trigger: mock(async () => {}) },
}));

//   Rate-limit util – silence background task
mock.module("../../utils/rate-limit", () => ({
	checkAndNotifyRateLimit: () => {},
}));

// ---------- After mocks, import router ----------
import { openaiRouter } from "../../routes/openai";

// ---------- Test ----------
describe("OpenAI proxy route", () => {
	let app: Hono;

	beforeEach(() => {
		mockProxy.mockClear();
		mockCreateExecution.mockClear();

		app = new Hono().basePath("/v1");
		app.route("/openai", openaiRouter);
	});

	test("happy path returns 200 and records execution", async () => {
		const res = await app.request(
			`/v1/openai/${TEST_PROJECT_ID}/chat/completions`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${TEST_BEARER}`,
					"x-ai-key": TEST_PARTIAL_API_KEY,
					"content-type": "application/json",
				},
				body: JSON.stringify({ messages: [] }),
			},
		);

		expect(res.status).toBe(200);
		expect(mockProxy).toHaveBeenCalledTimes(1);
		expect(mockCreateExecution).toHaveBeenCalledTimes(1);
		const execArgs = (mockCreateExecution.mock.calls as any)[0]?.[1] as any;
		expect(execArgs).toMatchObject({
			team_id: TEST_TEAM_ID,
			project_id: TEST_PROJECT_ID,
			finish_reason: "stop",
			response_code: 200,
		});
	});
});
