import { describe, test, expect } from "bun:test";
import { Hono } from "hono";
import { healthRouter } from "../../routes/health";

describe("Health Route", () => {
	test("GET /health on healthRouter directly should return OK and status 200", async () => {
		const app = new Hono();
		app.route("/", healthRouter); // Mount the health router

		const res = await app.request("/health");

		expect(res.status).toBe(200);
		expect(await res.text()).toBe("OK");
	});
	test("GET /health on a Hono instance with basePath('/v1') and healthRouter mounted at '/'", async () => {
		const testApp = new Hono().basePath("/v1");
		testApp.route("/", healthRouter);
		const res = await testApp.request("/v1/health");

		expect(res.status).toBe(200);
		expect(await res.text()).toBe("OK");
	});
});
