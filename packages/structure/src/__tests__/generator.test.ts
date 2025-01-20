import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodToJson, jsonToZod } from "../generator";
import type { JsonSchema } from "../types";

describe("zodToJson", () => {
	it("converts string schema", () => {
		const schema = z.string().describe("test description");
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "string",
			description: "test description",
			optional: false,
			nullable: false,
		});
	});

	it("converts number schema with constraints", () => {
		const schema = z.number().min(0).max(100).int();
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "number",
			min: 0,
			max: 100,
			int: true,
			optional: false,
			nullable: false,
		});
	});

	it("converts boolean schema", () => {
		const schema = z.boolean();
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "boolean",
			optional: false,
			nullable: false,
		});
	});

	it("converts array schema", () => {
		const schema = z.array(z.string());
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "array",
			optional: false,
			nullable: false,
			itemType: {
				type: "string",
				optional: false,
				nullable: false,
			},
		});
	});

	it("converts object schema", () => {
		const schema = z.object({
			name: z.string(),
			age: z.number(),
		});
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "object",
			optional: false,
			nullable: false,
			fields: {
				name: {
					type: "string",
					optional: false,
					nullable: false,
				},
				age: {
					type: "number",
					optional: false,
					nullable: false,
				},
			},
		});
	});

	it("converts union schema", () => {
		const schema = z.union([z.string(), z.number()]);
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "union",
			optional: false,
			nullable: false,
			variants: [
				{
					type: "string",
					optional: false,
					nullable: false,
				},
				{
					type: "number",
					optional: false,
					nullable: false,
				},
			],
		});
	});

	it("converts intersection schema", () => {
		const schema = z.intersection(
			z.object({ a: z.string() }),
			z.object({ b: z.number() }),
		);
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "intersection",
			optional: false,
			nullable: false,
			allOf: [
				{
					type: "object",
					optional: false,
					nullable: false,
					fields: {
						a: {
							type: "string",
							optional: false,
							nullable: false,
						},
					},
				},
				{
					type: "object",
					optional: false,
					nullable: false,
					fields: {
						b: {
							type: "number",
							optional: false,
							nullable: false,
						},
					},
				},
			],
		});
	});

	it("converts enum schema", () => {
		const schema = z.enum(["A", "B", "C"]);
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "enum",
			optional: false,
			nullable: false,
			values: ["A", "B", "C"],
		});
	});

	it("converts literal schema", () => {
		const schema = z.literal("test");
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "literal",
			optional: false,
			nullable: false,
			value: "test",
		});
	});

	it("converts date schema", () => {
		const schema = z.date();
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "date",
			optional: false,
			nullable: false,
		});
	});

	it("handles optional schemas", () => {
		const schema = z.string().optional();
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "string",
			optional: true,
			nullable: false,
		});
	});

	it("handles nullable schemas", () => {
		const schema = z.string().nullable();
		const result = zodToJson(schema);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			type: "string",
			optional: false,
			nullable: true,
		});
	});
});

describe("jsonToZod", () => {
	it("converts string schema", () => {
		const json: JsonSchema = {
			type: "string",
			description: "test description",
		};
		const result = jsonToZod(json);

		expect(result.success).toBe(true);
		expect(result.data?.description).toBe("test description");
	});

	it("converts number schema with constraints", () => {
		const json: JsonSchema = {
			type: "number",
			min: 0,
			max: 100,
			int: true,
		};
		const result = jsonToZod(json);

		expect(result.success).toBe(true);
		const parsed = result.data?.safeParse(50);
		expect(parsed?.success).toBe(true);
	});

	it("converts object schema with nested fields", () => {
		const json: JsonSchema = {
			type: "object",
			fields: {
				name: { type: "string" },
				age: { type: "number" },
				address: {
					type: "object",
					fields: {
						street: { type: "string" },
						city: { type: "string" },
					},
				},
			},
		};
		const result = jsonToZod(json);

		expect(result.success).toBe(true);
		const parsed = result.data?.safeParse({
			name: "Test",
			age: 25,
			address: {
				street: "123 Main St",
				city: "Test City",
			},
		});
		expect(parsed?.success).toBe(true);
	});

	it("converts array schema", () => {
		const json: JsonSchema = {
			type: "array",
			itemType: { type: "string" },
			minLength: 1,
			maxLength: 3,
		};
		const result = jsonToZod(json);

		expect(result.success).toBe(true);
		const parsed = result.data?.safeParse(["test"]);
		expect(parsed?.success).toBe(true);
	});

	it("handles optional and nullable fields", () => {
		const json: JsonSchema = {
			type: "object",
			fields: {
				required: { type: "string" },
				optional: { type: "string", optional: true },
				nullable: { type: "string", nullable: true },
			},
		};
		const result = jsonToZod(json);

		expect(result.success).toBe(true);
		const schema = result.data;

		expect(
			schema?.safeParse({
				required: "test",
				optional: undefined,
				nullable: null,
			}).success,
		).toBe(true);
	});

	it("handles default values", () => {
		const json: JsonSchema = {
			type: "string",
			defaultValue: "default",
		};
		const result = jsonToZod(json);

		expect(result.success).toBe(true);
		const schema = result.data;
		expect(schema?.parse(undefined)).toBe("default");
	});
});
