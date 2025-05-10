// Preloaded mocks: server-only, @proxed/kv

import { describe, test, expect, mock, beforeEach } from "bun:test";
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { ErrorCode, AppError } from "../../utils/errors";
import type { AuthMiddlewareVariables, AuthSession } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@proxed/supabase/types";

// --- Mocks ---

// Mock @proxed/supabase/api
const mockSupabaseClient = {
	// Add any methods that authMiddleware might call directly on the client if any
	// For now, queries are separate.
	rpc: mock(),
} as unknown as SupabaseClient<Database>; // Cast to satisfy type, methods are mocked as needed
const mockCreateSupabaseClient = mock(async () => mockSupabaseClient);
mock.module("@proxed/supabase/api", () => ({
	createClient: mockCreateSupabaseClient,
}));

// Mock @proxed/supabase/queries
const mockGetProjectQuery = mock();
const mockGetTeamLimitsMetricsQuery = mock();
mock.module("@proxed/supabase/queries", () => ({
	getProjectQuery: mockGetProjectQuery,
	getTeamLimitsMetricsQuery: mockGetTeamLimitsMetricsQuery,
}));

// Mock ../../utils/verify-device-check
const mockVerifyDeviceCheckToken = mock();
mock.module("../../utils/verify-device-check", () => ({
	verifyDeviceCheckToken: mockVerifyDeviceCheckToken,
}));

// ../../utils/token-parser is already tested, will be used as is.

// --- Test Suite ---
describe("authMiddleware", () => {
	let app: Hono<{ Variables: AuthMiddlewareVariables }>;
	let headerApp: Hono<{ Variables: AuthMiddlewareVariables }>;
	let mockTerminalHandler: any; // This will be the spy for the end of a successful chain
	let mockSet: any; // Spy for c.set

	const defaultProjectId = "test-project-id";
	const defaultTeamId = "test-team-id";
	const defaultTestKey = "secret-test-key";
	const defaultPartialApiKey = "pk_client_part";

	// Define a mock for Tables<"device_checks"> to be used in mockProject
	const mockDeviceCheckConfigData: Tables<"device_checks"> = {
		id: "dc-config-id-123",
		apple_team_id: "APPLE_TEAM_ID",
		key_id: "KEY_ID",
		private_key_p8:
			"-----BEGIN PRIVATE KEY-----\nYOURKEY\n-----END PRIVATE KEY-----",
		created_at: new Date().toISOString(),
		name: "Default Device Check Config",
		team_id: defaultTeamId,
		updated_at: new Date().toISOString(),
	};

	// Base mock project data satisfying Tables<"projects">
	// We will create a new copy and modify it in beforeEach or describe blocks
	const baseMockProject: Tables<"projects"> = {
		id: defaultProjectId,
		team_id: defaultTeamId,
		name: "Test Project",
		test_mode: false,
		test_key: defaultTestKey,
		device_check_id: null, // Default to null, can be overridden for specific tests
		system_prompt: "You are a helpful assistant.",
		default_user_prompt: "Hello",
		model: "gpt-3.5-turbo",
		key_id: "key-id-123",
		schema_config: { type: "object", fields: {} } as any, // Cast for simplicity
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		notification_threshold: 1000,
		notification_interval_seconds: 3600,
		// Add missing fields required by Tables<"projects">
		bundle_id: "com.example.test",
		description: "A test project description.",
		icon_url: "https://example.com/icon.png",
		is_active: true,
		last_rate_limit_notified_at: null,
		// key: { provider: "OPENAI" } // Will be added ad-hoc by mockGetProjectQuery if needed for a test
	};

	const mockLimits = {
		api_calls_used: 50,
		api_calls_limit: 100,
	};

	// This will hold the project data for the current test, including ad-hoc modifications like project.device_check config
	let currentTestProjectData: Tables<"projects"> & {
		device_check: Tables<"device_checks"> | null;
		key: any;
	};

	const globalErrorHandler = (err: Error, c: any) => {
		// console.log("[TEST_DEBUG] globalErrorHandler caught:", err);
		if (err instanceof AppError) {
			// console.log("[TEST_DEBUG] AppError code:", err.code, "message:", err.message, "status:", err.status);
			return c.json(
				{ error: err.code, message: err.message, details: err.details },
				err.status as any,
			);
		}
		// console.error("Unhandled test error in globalErrorHandler (not AppError):", err);
		return c.json(
			{ error: ErrorCode.INTERNAL_ERROR, message: "Global unhandled error" },
			500,
		);
	};

	beforeEach(() => {
		mockCreateSupabaseClient.mockClear();
		mockGetProjectQuery.mockReset();
		mockGetTeamLimitsMetricsQuery.mockReset();
		mockVerifyDeviceCheckToken.mockReset();
		(mockSupabaseClient.rpc as any).mockReset();
		mockTerminalHandler = mock((c: any) =>
			c.json(c.get("session") || { message: "Reached terminal handler" }),
		);
		mockSet = mock();

		// Setup default project data for each test, can be overridden in describe/test blocks
		currentTestProjectData = {
			...baseMockProject,
			device_check: null, // This is where the actual device_check config object or null will go
			key: { provider: "OPENAI" }, // Default key info for project.key.provider access
		};
		mockGetProjectQuery.mockImplementation(async () => ({
			data: currentTestProjectData,
			error: null,
		}));

		mockGetTeamLimitsMetricsQuery.mockResolvedValue({
			data: { ...mockLimits },
			error: null,
		});
		mockVerifyDeviceCheckToken.mockResolvedValue(true);

		// App for path-based projectId tests
		app = new Hono<{ Variables: AuthMiddlewareVariables }>();
		app.onError(globalErrorHandler);
		app.use("/:projectId/*", async (c, next) => {
			c.set = mockSet;
			await next();
		});
		app.use("/:projectId/test", authMiddleware, mockTerminalHandler);
		// app.use("/no-project-id/test", authMiddleware, mockTerminalHandler); // To be replaced/removed

		// App for header-based projectId tests
		headerApp = new Hono<{ Variables: AuthMiddlewareVariables }>();
		headerApp.onError(globalErrorHandler);
		headerApp.use("/*", async (c, next) => {
			c.set = mockSet;
			await next();
		});
		headerApp.use("/test-no-param", authMiddleware, mockTerminalHandler);
		headerApp.use(
			"/some-other-fixed-path",
			authMiddleware,
			mockTerminalHandler,
		); // New route for this test
	});

	// --- Test Cases ---

	test("should throw MISSING_PROJECT_ID if no projectId is provided (using headerApp for clarity)", async () => {
		const res = await headerApp.request("/some-other-fixed-path"); // No x-project-id header
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe(ErrorCode.MISSING_PROJECT_ID);
		expect(mockTerminalHandler).not.toHaveBeenCalled();
	});

	test("should throw MISSING_PROJECT_ID if projectId from header is empty string", async () => {
		const res = await headerApp.request("/test-no-param", {
			headers: { "x-project-id": "" },
		});
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe(ErrorCode.MISSING_PROJECT_ID);
		expect(mockTerminalHandler).not.toHaveBeenCalled();
	});

	test("should use projectId from header if path param is not present", async () => {
		const headerProjectId = "header-project-id";
		const projectForHeaderTest = {
			...currentTestProjectData,
			id: headerProjectId,
			test_mode: true,
		};
		mockGetProjectQuery.mockResolvedValueOnce({
			data: projectForHeaderTest,
			error: null,
		});

		await headerApp.request("/test-no-param", {
			headers: {
				"x-project-id": headerProjectId,
				"x-proxed-test-key": defaultTestKey,
				"x-ai-key": defaultPartialApiKey,
			},
		});
		expect(mockTerminalHandler).toHaveBeenCalled();
		expect(mockGetProjectQuery).toHaveBeenCalledWith(
			expect.anything(),
			headerProjectId,
		);
		expect(mockSet).toHaveBeenCalledWith(
			"session",
			expect.objectContaining({
				projectId: headerProjectId,
				token: defaultTestKey,
			}),
		);
	});

	test("should throw PROJECT_NOT_FOUND if getProjectQuery returns error", async () => {
		mockGetProjectQuery.mockResolvedValue({
			data: null,
			error: new Error("DB error"),
		});
		const res = await app.request(`/${defaultProjectId}/test`);
		expect(res.status).toBe(404);
		const body = await res.json();
		expect(body.error).toBe(ErrorCode.PROJECT_NOT_FOUND);
	});

	test("should throw PROJECT_NOT_FOUND if getProjectQuery returns no project data", async () => {
		mockGetProjectQuery.mockResolvedValue({ data: null, error: null });
		const res = await app.request(`/${defaultProjectId}/test`);
		expect(res.status).toBe(404);
	});

	// Test Key Auth Path
	describe("Test Key Authentication", () => {
		beforeEach(() => {
			currentTestProjectData = {
				...baseMockProject,
				test_mode: true,
				device_check: null, // Explicitly null for test key path (no device check config)
				key: { provider: "OPENAI" },
			};
			// mockGetProjectQuery is already set up in the outer beforeEach to return currentTestProjectData
		});

		test("should authenticate with valid test key and x-ai-key", async () => {
			await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-proxed-test-key": defaultTestKey,
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(mockTerminalHandler).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalledWith(
				"session",
				expect.objectContaining({
					token: defaultTestKey,
					apiKey: defaultPartialApiKey,
				}),
			);
		});

		test("should throw UNAUTHORIZED if test key is valid but x-ai-key is missing", async () => {
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: { "x-proxed-test-key": defaultTestKey },
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.UNAUTHORIZED);
			expect(body.message).toContain(
				"Missing x-ai-key header for test key auth",
			);
		});

		test("should proceed to other auth if test_key doesn't match (project in test_mode)", async () => {
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: null,
				error: new Error("Simulate no billing"),
			});
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-proxed-test-key": "invalid-key",
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.message).toBe("No billing information found");
		});

		test("should proceed to other auth if project is NOT in test_mode (valid key provided)", async () => {
			currentTestProjectData.test_mode = false;
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: null,
				error: new Error("Simulate no billing"),
			});
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-proxed-test-key": defaultTestKey,
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.message).toBe("No billing information found");
		});
	});

	describe("Billing/Limits Checks", () => {
		beforeEach(() => {
			// Ensure project is NOT in test mode, or test key is invalid, so test key auth doesn't short-circuit
			currentTestProjectData = {
				...baseMockProject,
				test_mode: false, // Not in test mode for these checks to be certainly hit after project load
				device_check: null, // Default, can be overridden if a test path needs it later
				key: { provider: "OPENAI" },
			};
			// mockGetProjectQuery is configured in the main beforeEach to return currentTestProjectData
		});

		test("should throw UNAUTHORIZED if getTeamLimitsMetricsQuery returns no data", async () => {
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: null,
				error: null,
			});

			const res = await app.request(`/${defaultProjectId}/test`, {
				// No specific auth headers that would pass before limits check
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.UNAUTHORIZED);
			expect(body.message).toBe("No billing information found");
			expect(mockTerminalHandler).not.toHaveBeenCalled();
		});

		test("should throw UNAUTHORIZED if getTeamLimitsMetricsQuery returns an error", async () => {
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: null,
				error: new Error("DB error fetching limits"),
			});

			const res = await app.request(`/${defaultProjectId}/test`);
			expect(res.status).toBe(401); // Should map to UNAUTHORIZED as per current code if !limits
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.UNAUTHORIZED);
			expect(body.message).toBe("No billing information found"); // Middleware has specific message for !limits
			expect(mockTerminalHandler).not.toHaveBeenCalled();
		});

		test("should throw FORBIDDEN if API calls limit is reached", async () => {
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: { ...mockLimits, api_calls_used: 100, api_calls_limit: 100 },
				error: null,
			});

			const res = await app.request(`/${defaultProjectId}/test`);
			expect(res.status).toBe(403);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.FORBIDDEN);
			expect(body.message).toBe(
				"API calls limit reached for your current plan",
			);
			expect(mockTerminalHandler).not.toHaveBeenCalled();
		});

		test("should proceed if API calls limit is present but not reached", async () => {
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: { ...mockLimits, api_calls_used: 50, api_calls_limit: 100 },
				error: null,
			});
			// This request will fail further down because no other valid auth token is provided
			// The point is to check that it PASSES the limits check.
			// It will eventually hit the final "Invalid or missing credentials" error.
			const res = await app.request(`/${defaultProjectId}/test`);
			expect(res.status).toBe(401); // Failing due to no further auth method passing
			const body = await res.json();
			expect(body.message).toBe("Invalid or missing credentials");
		});

		test("should proceed if API calls limit is null (unlimited)", async () => {
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: { ...mockLimits, api_calls_limit: null }, // Unlimited
				error: null,
			});
			const res = await app.request(`/${defaultProjectId}/test`);
			expect(res.status).toBe(401); // Failing due to no further auth method passing
			const body = await res.json();
			expect(body.message).toBe("Invalid or missing credentials");
		});
	});

	describe("Bearer Token Authentication", () => {
		const validApiKeyPart = "pk_client_part_bearer";
		const validDeviceTokenPart = Buffer.from(
			"valid-device-token-data",
		).toString("base64");
		const validCombinedTokenDevice = `${validApiKeyPart}.${validDeviceTokenPart}`;
		const validCombinedTokenTestKey = `${validApiKeyPart}.${defaultTestKey}`;

		beforeEach(() => {
			// Default: project not in test mode, device check config IS present for these tests
			currentTestProjectData = {
				...baseMockProject,
				test_mode: false,
				device_check_id: mockDeviceCheckConfigData.id, // Has a device_check_id
				device_check: mockDeviceCheckConfigData, // Has the actual device_check config
				key: { provider: "OPENAI" },
			};
			// Limits are fine by default from outer beforeEach
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: { ...mockLimits },
				error: null,
			});
		});

		test("should throw INVALID_TOKEN if Bearer token format is invalid (no dot)", async () => {
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: { Authorization: "Bearer invalidformat" },
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.INVALID_TOKEN);
			expect(body.message).toContain("Invalid authorization token format");
		});

		test("should throw INVALID_TOKEN if Bearer token format is invalid (ends with dot)", async () => {
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: { Authorization: `Bearer ${validApiKeyPart}.` },
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.INVALID_TOKEN);
		});

		describe("Test Mode via Bearer Token", () => {
			beforeEach(() => {
				currentTestProjectData.test_mode = true; // Project IS in test mode
				currentTestProjectData.device_check = null; // Device check not relevant / might not be configured
				currentTestProjectData.device_check_id = null;
			});

			test("should authenticate if tokenPart matches project.test_key and project in test_mode", async () => {
				await app.request(`/${defaultProjectId}/test`, {
					headers: { Authorization: `Bearer ${validCombinedTokenTestKey}` },
				});
				expect(mockTerminalHandler).toHaveBeenCalled();
				expect(mockSet).toHaveBeenCalledWith(
					"session",
					expect.objectContaining({
						token: defaultTestKey,
						apiKey: validApiKeyPart,
					}),
				);
			});
		});

		describe("Device Check via Bearer Token", () => {
			beforeEach(() => {
				currentTestProjectData.test_mode = false; // Ensure not falling into test_key path
				// device_check and device_check_id are set by the outer Bearer Token Auth describe block's beforeEach
			});

			test("should throw INVALID_TOKEN if project.device_check config is missing (but ID might be present)", async () => {
				currentTestProjectData.device_check = null; // Simulate missing config object
				// Note: The middleware currently checks `!project.device_check` which uses the config object itself.
				// If `device_check_id` was present but the join/fetch of actual config failed, this is the state.
				const res = await app.request(`/${defaultProjectId}/test`, {
					headers: { Authorization: `Bearer ${validCombinedTokenDevice}` },
				});
				expect(res.status).toBe(401);
				const body = await res.json();
				expect(body.error).toBe(ErrorCode.INVALID_TOKEN);
				expect(body.message).toBe("Invalid authentication credentials"); // As per current middleware code for !project.device_check
			});

			test("should authenticate if device check is valid", async () => {
				mockVerifyDeviceCheckToken.mockResolvedValue(true);
				await app.request(`/${defaultProjectId}/test`, {
					headers: { Authorization: `Bearer ${validCombinedTokenDevice}` },
				});
				expect(mockTerminalHandler).toHaveBeenCalled();
				expect(mockVerifyDeviceCheckToken).toHaveBeenCalledWith(
					Buffer.from(validDeviceTokenPart, "base64"),
					mockDeviceCheckConfigData,
				);
				expect(mockSet).toHaveBeenCalledWith(
					"session",
					expect.objectContaining({
						token: validDeviceTokenPart,
						apiKey: validApiKeyPart,
					}),
				);
			});

			test("should throw INVALID_TOKEN if device check is invalid", async () => {
				mockVerifyDeviceCheckToken.mockResolvedValue(false);
				const res = await app.request(`/${defaultProjectId}/test`, {
					headers: { Authorization: `Bearer ${validCombinedTokenDevice}` },
				});
				expect(res.status).toBe(401);
				const body = await res.json();
				expect(body.error).toBe(ErrorCode.INVALID_TOKEN);
				expect(body.message).toBe("Invalid authentication credentials");
				expect(mockTerminalHandler).not.toHaveBeenCalled();
			});

			test("should throw INVALID_TOKEN (wrapping AppError) if verifyDeviceCheckToken throws AppError", async () => {
				const appError = new AppError(
					ErrorCode.INTERNAL_ERROR,
					"Verification service down",
					503,
				);
				mockVerifyDeviceCheckToken.mockRejectedValue(appError);
				const res = await app.request(`/${defaultProjectId}/test`, {
					headers: { Authorization: `Bearer ${validCombinedTokenDevice}` },
				});
				expect(res.status).toBe(503);
				const body = await res.json();
				expect(body.error).toBe(ErrorCode.INTERNAL_ERROR);
				expect(body.message).toBe("Verification service down");
			});

			test("should throw INVALID_TOKEN (generic) if verifyDeviceCheckToken throws a non-AppError", async () => {
				mockVerifyDeviceCheckToken.mockRejectedValue(
					new Error("Some other error"),
				);
				const res = await app.request(`/${defaultProjectId}/test`, {
					headers: { Authorization: `Bearer ${validCombinedTokenDevice}` },
				});
				expect(res.status).toBe(401);
				const body = await res.json();
				expect(body.error).toBe(ErrorCode.INVALID_TOKEN);
				expect(body.message).toBe("Device token verification failed");
			});
		});
	});

	describe("Legacy Device Token Authentication", () => {
		const validDeviceTokenHeader = Buffer.from(
			"valid-legacy-device-token-data",
		).toString("base64");

		beforeEach(() => {
			// Project settings for this suite: device check is enabled, not in test mode.
			currentTestProjectData = {
				...baseMockProject,
				test_mode: false,
				device_check_id: mockDeviceCheckConfigData.id,
				device_check: mockDeviceCheckConfigData, // Device check config is present
				key: { provider: "OPENAI" },
			};
			// Limits are fine by default
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: { ...mockLimits },
				error: null,
			});
			// Default to successful device token verification
			mockVerifyDeviceCheckToken.mockResolvedValue(true);
		});

		test("should authenticate with valid x-device-token and x-ai-key", async () => {
			await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-device-token": validDeviceTokenHeader,
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(mockTerminalHandler).toHaveBeenCalled();
			expect(mockVerifyDeviceCheckToken).toHaveBeenCalledWith(
				Buffer.from(validDeviceTokenHeader, "base64"),
				mockDeviceCheckConfigData,
			);
			expect(mockSet).toHaveBeenCalledWith(
				"session",
				expect.objectContaining({
					// token: undefined, // As per current auth.ts logic for this path
					apiKey: defaultPartialApiKey,
				}),
			);
			// Verify that the session object DOES NOT contain 'token' for this specific flow
			const lastSetCall = mockSet.mock.calls[mockSet.mock.calls.length - 1];
			expect(lastSetCall[1]).not.toHaveProperty("token");
		});

		test("should throw UNAUTHORIZED if x-device-token is present but x-ai-key is missing", async () => {
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: { "x-device-token": validDeviceTokenHeader },
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.UNAUTHORIZED);
			expect(body.message).toBe("Missing required credentials");
		});

		test("should throw INVALID_TOKEN if x-device-token is invalid (verifyDeviceCheckToken returns false)", async () => {
			mockVerifyDeviceCheckToken.mockResolvedValue(false);
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-device-token": validDeviceTokenHeader,
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.INVALID_TOKEN);
			expect(body.message).toBe("Invalid authentication credentials");
		});

		test("should throw INTERNAL_ERROR if verifyDeviceCheckToken throws a generic error", async () => {
			// Note: auth.ts for this path wraps generic errors into INTERNAL_ERROR
			mockVerifyDeviceCheckToken.mockRejectedValue(
				new Error("Verification mechanism failed"),
			);
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-device-token": validDeviceTokenHeader,
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(500);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.INTERNAL_ERROR);
			expect(body.message).toBe("Authentication failed");
		});

		test("should throw specific AppError if verifyDeviceCheckToken throws an AppError", async () => {
			const specificAppError = new AppError(
				ErrorCode.BAD_REQUEST,
				"Bad device token format from verifier",
				400,
			);
			mockVerifyDeviceCheckToken.mockRejectedValue(specificAppError);
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-device-token": validDeviceTokenHeader,
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(400);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.BAD_REQUEST);
			expect(body.message).toBe("Bad device token format from verifier");
		});

		test("should fall through if project.device_check config is missing", async () => {
			currentTestProjectData.device_check = null; // Simulate missing actual config
			// This will bypass the legacy device token block and hit the final unauthorized error
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					"x-device-token": validDeviceTokenHeader,
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.UNAUTHORIZED);
			expect(body.message).toBe("Invalid or missing credentials"); // Final fallback error
		});
	});

	describe("No Valid Authentication Method", () => {
		beforeEach(() => {
			// Project is not in test mode, no device check config, or device check will fail
			// Limits are fine
			currentTestProjectData = {
				...baseMockProject,
				test_mode: false,
				device_check_id: null, // No device check ID
				device_check: null, // No device check config
				key: { provider: "OPENAI" },
			};
			mockGetTeamLimitsMetricsQuery.mockResolvedValue({
				data: { ...mockLimits },
				error: null,
			});
			// mockVerifyDeviceCheckToken doesn't need specific setup here as it shouldn't be reached if no token is provided
		});

		test("should throw UNAUTHORIZED if no recognized auth headers are present", async () => {
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					// No x-proxed-test-key
					// No Authorization: Bearer ...
					// No x-device-token
					// Only x-ai-key might be present, but it's not enough on its own without a primary auth method
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.UNAUTHORIZED);
			expect(body.message).toBe("Invalid or missing credentials");
			expect(mockTerminalHandler).not.toHaveBeenCalled();
		});

		test("should throw UNAUTHORIZED if only x-ai-key is present", async () => {
			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: { "x-ai-key": defaultPartialApiKey },
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			expect(body.error).toBe(ErrorCode.UNAUTHORIZED);
			expect(body.message).toBe("Invalid or missing credentials");
		});

		test("should throw UNAUTHORIZED if headers for one method are present but incomplete/invalid (e.g., Bearer without token part)", async () => {
			// This scenario is already covered by Bearer token format tests, but good to have a general fallthrough test.
			// Here, project.device_check is null, so Bearer token with device token part would fail early if !project.device_check
			// If it were a malformed bearer token for test key, it would also fail.
			currentTestProjectData.device_check_id = "some-dc-id"; // Give it an ID
			currentTestProjectData.device_check = null; // But no actual config

			const res = await app.request(`/${defaultProjectId}/test`, {
				headers: {
					Authorization: "Bearer malformedbearer",
					"x-ai-key": defaultPartialApiKey,
				},
			});
			expect(res.status).toBe(401);
			const body = await res.json();
			// This specific case will fail at `parseCombinedToken` -> INVALID_TOKEN
			// If it passed that, and `project.device_check` was null, it would be INVALID_TOKEN "Invalid authentication credentials"
			// If it somehow got to the end, it would be UNAUTHORIZED "Invalid or missing credentials"
			// The actual error depends on how far it gets.
			// For "Bearer malformedbearer", it hits the `!bearerApiKeyPart || !bearerTokenPart` check.
			expect(body.error).toBe(ErrorCode.INVALID_TOKEN);
			expect(body.message).toContain("Invalid authorization token format");
		});
	});
});
