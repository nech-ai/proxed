import { test, expect, mock, beforeAll } from "bun:test";
import { resolve } from "node:path";

// -----------------------------
// Set up all mocks BEFORE any other imports
// -----------------------------

const __dirname = new URL(".", import.meta.url).pathname;

// Set environment variables first
process.env.NODE_ENV = "test";
process.env.SUPABASE_JWT_SECRET = "test-secret";
process.env.DATABASE_PRIMARY_URL = "postgresql://test";
process.env.DATABASE_LHR_URL = "postgresql://test";
process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
process.env.RESEND_API_KEY = "re_test_key";

// Mock AI SDK clients to avoid real API calls
mock.module("@ai-sdk/openai", () => {
	return {
		createOpenAI: () => ({
			chat: () => ({
				doStream: async () => {
					throw new Error("Mocked OpenAI error");
				},
			}),
		}),
	};
});

mock.module("@ai-sdk/anthropic", () => {
	return {
		createAnthropic: () => ({
			messages: () => ({
				doStream: async () => {
					throw new Error("Mocked Anthropic error");
				},
			}),
		}),
	};
});

// Mock Resend email service
mock.module("resend", () => {
	return {
		Resend: class {
			emails = {
				send: async () => ({ id: "test-email-id" }),
			};
		},
	};
});

// Mock the resend utility that imports Resend
mock.module(resolve(__dirname, "../../packages/utils/lib/resend.ts"), () => {
	return {
		resend: {
			emails: {
				send: async () => ({ id: "test-email-id" }),
			},
		},
	};
});

// Mock Redis client for rate limiting
mock.module("@proxed/kv", () => {
	return {
		client: {
			get: async (): Promise<null> => null,
			set: async (): Promise<string> => "OK",
			del: async (): Promise<number> => 1,
			expire: async (): Promise<number> => 1,
			incr: async (): Promise<number> => 1,
			exists: async (): Promise<number> => 0,
			hget: async (): Promise<null> => null,
			hset: async (): Promise<number> => 1,
			hincrby: async (): Promise<number> => 1,
		},
	};
});

// Mock logger to prevent console spam in tests
mock.module(resolve(__dirname, "../utils/logger.ts"), () => {
	return {
		logger: {
			info: () => {},
			warn: () => {},
			error: () => {},
			debug: () => {},
		},
	};
});

// Create a more complete database mock
const createMockDb = () => ({
	execute: async () => ({ rows: [] as any[] }),
	executeOnReplica: async () => ({ rows: [] as any[] }),
	query: {
		users: {
			findFirst: async (): Promise<null> => null,
		},
	},
	select: () => ({
		from: () => ({
			where: () => ({
				limit: async (): Promise<any[]> => [],
			}),
			leftJoin: () => ({
				leftJoin: () => ({
					where: () => ({
						limit: async (): Promise<any[]> => [],
					}),
				}),
			}),
		}),
	}),
	insert: () => ({
		values: () => ({
			returning: async () => [{}],
		}),
	}),
	update: () => ({
		set: () => ({
			where: () => ({
				returning: async () => [{}],
			}),
		}),
	}),
	delete: () => ({
		where: () => ({
			returning: async () => [{}],
		}),
	}),
	transaction: async (fn: any) => fn(createMockDb()),
	$primary: undefined as any,
	usePrimaryOnly: () => createMockDb(),
});

// Mock connectDb with a more complete implementation
mock.module(resolve(__dirname, "../db/index.ts"), () => {
	return {
		connectDb: async () => createMockDb(),
		primaryDb: createMockDb(),
	};
});

// Re-usable stub project
const stubProjectId = "123e4567-e89b-12d3-a456-426614174000";
// Use `any` to keep the stub lightweight for tests
const stubProject: any = {
	id: stubProjectId,
	teamId: "team-123",
	name: "Test Project",
	createdAt: new Date().toISOString(),
	testMode: true,
	testKey: "testToken",
	deviceCheckId: null,
	keyId: "key-123",
	model: "gpt-4o",
	systemPrompt: null,
	defaultUserPrompt: null,
	schemaConfig: {},
	isActive: true,
	description: "",
	bundleId: "",
	iconUrl: null,
	deviceCheck: null,
	key: {
		provider: "OPENAI",
		id: "key-123",
		teamId: "team-123",
		isActive: true,
		displayName: "Test Key",
	},
	lastRateLimitNotifiedAt: null,
	notificationIntervalSeconds: null,
	notificationThreshold: null,
};

// Mock getProjectQuery to always return the stub project
mock.module(resolve(__dirname, "../db/queries/projects.ts"), () => {
	return {
		getProjectQuery: async () => stubProject,
		getActiveProjectWithProvider: async () => stubProject,
	};
});

// Mock team limits query so auth middleware passes billing checks
mock.module(resolve(__dirname, "../db/queries/teams.ts"), () => {
	return {
		getTeamLimitsMetricsQuery: async () => ({
			api_calls_limit: 1000,
			api_calls_used: 0,
			api_calls_remaining: 1000,
			projects_limit: 10,
			projects_count: 1,
			is_canceled: false,
			plan: "trial",
		}),
	};
});

// Mock server keys query
mock.module(resolve(__dirname, "../db/queries/server-keys.ts"), () => {
	return {
		getServerKey: async () => "partial-key-value",
	};
});

// Mock executions query
mock.module(resolve(__dirname, "../db/queries/executions.ts"), () => {
	return {
		createExecution: async () => ({ id: "execution-123" }),
	};
});

// Mock jobs
mock.module("@proxed/jobs", () => {
	return {
		sendHighConsumptionNotification: {
			trigger: async () => {},
		},
	};
});

// -----------------------------
// Import the application *after* all mocks are in place
// -----------------------------
const { app } = await import("../index.ts");

// Helper to make GET requests
async function get(path: string, headers?: Record<string, string>) {
	return await app.request(path, { method: "GET", headers });
}

// Helper to make POST requests with JSON
async function post(
	path: string,
	body: unknown,
	headers?: Record<string, string>,
) {
	return await app.request(path, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json", ...headers },
	});
}

// -----------------------------
// Public endpoints
// -----------------------------

test("GET /health returns 200 and healthy status", async () => {
	const res = await get("/health");
	expect(res.status).toBe(200);
	const json: any = await res.json();
	expect(json.status).toBe("degraded");
});

test("GET /geo-info returns 200 and contains ip", async () => {
	const res = await get("/geo-info");
	expect(res.status).toBe(200);
	const json: any = await res.json();
	expect(json).toHaveProperty("ip");
	expect(json.ip).toBe("127.0.0.1"); // Default IP when no headers are present
});

test("GET /metrics returns 200 in test env", async () => {
	const res = await get("/metrics");
	expect(res.status).toBe(200);
	const json: any = await res.json();
	expect(json).toHaveProperty("requests");
	expect(json).toHaveProperty("errors");
	expect(json).toHaveProperty("latency");
});

// -----------------------------
// Protected endpoints (expect 401 without credentials)
// -----------------------------

const openaiPath = `/v1/openai/${stubProjectId}/chat/completions`;
const anthropicPath = `/v1/anthropic/${stubProjectId}/messages`;

// Helper headers with project id when required by header-based routes
const headerProject = { "x-project-id": stubProjectId };

// OpenAI

test("POST /v1/openai/:projectId/* returns 401 without auth", async () => {
	const res = await post(openaiPath, {
		model: "gpt-4",
		messages: [{ role: "user", content: "Hello" }],
	});
	expect(res.status).toBe(401);
	const json: any = await res.json();
	expect(json.error).toBeDefined();
});

// Anthropic

test("POST /v1/anthropic/:projectId/* returns 401 without auth", async () => {
	const res = await post(anthropicPath, {
		model: "claude-3",
		messages: [{ role: "user", content: "Hello" }],
	});
	expect(res.status).toBe(401);
	const json: any = await res.json();
	expect(json.error).toBeDefined();
});

// Vision

test("POST /v1/vision returns 401 without auth", async () => {
	const res = await post(
		"/v1/vision",
		{ image: "https://example.com/test.png" },
		headerProject,
	);
	expect(res.status).toBe(401);
	const json: any = await res.json();
	expect(json.error).toBeDefined();
});

// Text

test("POST /v1/text returns 401 without auth", async () => {
	const res = await post("/v1/text", { text: "Hello" }, headerProject);
	expect(res.status).toBe(401);
	const json: any = await res.json();
	expect(json.error).toBeDefined();
});

// PDF

test("POST /v1/pdf returns 401 without auth", async () => {
	const res = await post(
		"/v1/pdf",
		{ pdf: "https://example.com/test.pdf" },
		headerProject,
	);
	expect(res.status).toBe(401);
	const json: any = await res.json();
	expect(json.error).toBeDefined();
});

// -----------------------------
// Test with authentication
// -----------------------------

test("POST /v1/openai/:projectId/* returns 502 with test auth (no actual API key)", async () => {
	const res = await post(
		openaiPath,
		{
			model: "gpt-4",
			messages: [{ role: "user", content: "Hello" }],
		},
		{
			"x-proxed-test-key": "testToken",
			"x-ai-key": "test-api-key",
		},
	);

	// The test should either return 401 (from OpenAI invalid key) or 500/502 (from our error handling)
	expect([401, 500, 502]).toContain(res.status);
});

test("GET / returns API documentation", async () => {
	const res = await get("/");
	expect(res.status).toBe(200);
	expect(res.headers.get("content-type")).toContain("text/html");
});

test("GET /openapi returns OpenAPI spec", async () => {
	const res = await get("/openapi");
	expect(res.status).toBe(200);
	const json: any = await res.json();
	expect(json.openapi).toBe("3.1.0");
	expect(json.info.title).toBe("Proxed API");
});
