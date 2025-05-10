import { describe, test, expect, mock } from "bun:test";
import { getCommonExecutionParams } from "../../utils/execution-params";
import { Headers } from "@proxed/location/constants"; // Assuming Headers are exported from here
import type { CommonExecutionParams } from "../../types";
import type { Context } from "hono";

describe("getCommonExecutionParams", () => {
	const mockHeader = mock((headerName: string) => {
		switch (headerName) {
			case Headers.CountryCode:
				return "US";
			case Headers.RegionCode:
				return "CA";
			case Headers.City:
				return "San Francisco";
			case Headers.Longitude:
				return "-122.4194";
			case Headers.Latitude:
				return "37.7749";
			default:
				return undefined;
		}
	});

	const mockContext: Partial<Context> = {
		req: {
			header: mockHeader as any,
		} as any,
	};

	const baseParams: Omit<CommonExecutionParams, "c"> = {
		teamId: "test-team-id",
		projectId: "test-project-id",
		deviceCheckId: "test-device-check-id",
		keyId: "test-key-id",
		ip: "127.0.0.1",
		userAgent: "test-user-agent",
		model: "test-model",
		provider: "OPENAI",
	};

	test("should correctly map all parameters when headers are present", () => {
		const params = getCommonExecutionParams({
			...baseParams,
			c: mockContext as Context,
		});

		expect(params).toEqual({
			team_id: "test-team-id",
			project_id: "test-project-id",
			device_check_id: "test-device-check-id",
			key_id: "test-key-id",
			ip: "127.0.0.1",
			user_agent: "test-user-agent",
			model: "test-model",
			provider: "OPENAI",
			country_code: "US",
			region_code: "CA",
			city: "San Francisco",
			longitude: -122.4194,
			latitude: 37.7749,
		});
	});

	test("should handle missing optional headers gracefully", () => {
		const mockHeaderMissing: any = (headerName: string) => {
			if (headerName === Headers.CountryCode) return "GB";
			// longitude, latitude, region, city are missing
			return undefined;
		};
		const mockContextMissing: Partial<Context> = {
			req: { header: mockHeaderMissing } as any,
		};

		const params = getCommonExecutionParams({
			...baseParams,
			c: mockContextMissing as Context,
		});

		expect(params.country_code).toBe("GB");
		expect(params.region_code).toBeUndefined();
		expect(params.city).toBeUndefined();
		// Number.parseFloat(undefined ?? "0") || undefined  will be undefined
		// Number.parseFloat(null ?? "0") || undefined will be undefined
		expect(params.longitude).toBeUndefined();
		expect(params.latitude).toBeUndefined();
	});

	test("should handle missing userAgent", () => {
		const params = getCommonExecutionParams({
			...baseParams,
			userAgent: undefined, // Explicitly set userAgent to undefined
			c: mockContext as Context,
		});
		expect(params.user_agent).toBeUndefined();
	});

	test("should handle invalid numeric headers by returning undefined", () => {
		const mockHeaderInvalidNumeric: any = (headerName: string) => {
			if (headerName === Headers.Longitude) return "not-a-number";
			if (headerName === Headers.Latitude) return "still-not-a-number";
			return "US"; // Default for others
		};
		const mockContextInvalidNumeric: Partial<Context> = {
			req: { header: mockHeaderInvalidNumeric } as any,
		};

		const params = getCommonExecutionParams({
			...baseParams,
			c: mockContextInvalidNumeric as Context,
		});

		expect(params.longitude).toBeUndefined();
		expect(params.latitude).toBeUndefined();
	});
});
