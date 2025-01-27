import { describe, expect, it } from "bun:test";
import { jsonToSwiftCode } from "../swift-converter";
import type { JsonSchema } from "../types";

describe("jsonToSwiftCode", () => {
	it("converts simple object schema", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				name: { type: "string" },
				age: { type: "number", int: true },
				isActive: { type: "boolean" },
			},
		};

		const result = jsonToSwiftCode(schema, "User");
		expect(result.success).toBe(true);
		expect(result.data).toContain("struct User: Codable {");
		expect(result.data).toContain("var name: String");
		expect(result.data).toContain("var age: Int");
		expect(result.data).toContain("var isActive: Bool");
	});

	it("handles optional and nullable fields", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				name: { type: "string", optional: true },
				age: { type: "number", nullable: true },
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain("var name: String?");
		expect(result.data).toContain("var age: Double?");
	});

	it("generates enum types", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				status: {
					type: "enum",
					values: ["ACTIVE", "INACTIVE", "PENDING"],
				},
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain("enum Status: String, Codable {");
		expect(result.data).toContain('case active = "ACTIVE"');
		expect(result.data).toContain('case inactive = "INACTIVE"');
		expect(result.data).toContain('case pending = "PENDING"');
	});

	it("handles arrays", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				tags: {
					type: "array",
					itemType: { type: "string" },
				},
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain("var tags: [String]");
	});

	it("handles default values", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				name: { type: "string", defaultValue: "John" },
				age: { type: "number", int: true, defaultValue: 18 },
				isActive: { type: "boolean", defaultValue: true },
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain('var name: String = "John"');
		expect(result.data).toContain("var age: Int = 18");
		expect(result.data).toContain("var isActive: Bool = true");
	});

	it("handles nested objects", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				user: {
					type: "object",
					fields: {
						name: { type: "string" },
						age: { type: "number", int: true },
					},
				},
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain("struct User: Codable {");
		expect(result.data).toContain("var name: String");
		expect(result.data).toContain("var age: Int");
	});

	it("handles arrays of objects", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				items: {
					type: "array",
					itemType: {
						type: "object",
						fields: {
							id: { type: "number", int: true },
							name: { type: "string" },
						},
					},
				},
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain("struct ItemsItem: Codable {");
		expect(result.data).toContain("var items: [ItemsItem]");
	});

	it("formats enum cases correctly", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				status: {
					type: "enum",
					values: ["ACTIVE_USER", "INACTIVE_USER", "PENDING-APPROVAL"],
				},
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain('case active_user = "ACTIVE_USER"');
		expect(result.data).toContain('case inactive_user = "INACTIVE_USER"');
		expect(result.data).toContain('case pending_approval = "PENDING-APPROVAL"');
	});

	it("handles default values", () => {
		const schema: JsonSchema = {
			type: "object",
			fields: {
				name: { type: "string", defaultValue: "John" },
				age: { type: "number", int: true, defaultValue: 18 },
				tags: {
					type: "array",
					itemType: { type: "string" },
					defaultValue: ["default"],
				},
			},
		};

		const result = jsonToSwiftCode(schema);
		expect(result.success).toBe(true);
		expect(result.data).toContain('var name: String = "John"');
		expect(result.data).toContain("var age: Int = 18");
		expect(result.data).toContain('var tags: [String] = ["default"]');
	});
});
