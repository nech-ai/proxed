import { describe, test, expect } from "bun:test";
import { SwiftParser } from "../parser/swift";
import type { JsonSchema } from "../types";

describe("SwiftParser", () => {
	describe("parse", () => {
		test("should parse a simple struct", () => {
			const input = `
struct User {
  let name: String
  var age: Int
}`;
			const parser = new SwiftParser(input);
			const result = parser.parse();

			expect(result).toHaveLength(1);
			expect(result[0].type).toBe("StructDeclaration");
			expect(result[0].name.name).toBe("User");
			expect(result[0].properties).toHaveLength(2);
			expect(result[0].properties[0].name.name).toBe("name");
			expect(result[0].properties[0].typeAnnotation.name).toBe("String");
			expect(result[0].properties[1].name.name).toBe("age");
			expect(result[0].properties[1].typeAnnotation.name).toBe("Int");
		});

		test("should parse optional and array types", () => {
			const input = `
struct Contact {
  var phones: [String]
  let email: String?
}`;
			const parser = new SwiftParser(input);
			const result = parser.parse();

			expect(result).toHaveLength(1);
			expect(result[0].properties).toHaveLength(2);
			expect(result[0].properties[0].typeAnnotation.isArray).toBe(true);
			expect(result[0].properties[0].typeAnnotation.name).toBe("String");
			expect(result[0].properties[1].typeAnnotation.isOptional).toBe(true);
			expect(result[0].properties[1].typeAnnotation.name).toBe("String");
		});

		test("should parse nested structs", () => {
			const input = `
struct User {
  let name: String
  struct Address {
    var street: String
    let city: String
  }
}`;
			const parser = new SwiftParser(input);
			const result = parser.parse();

			expect(result).toHaveLength(1);
			expect(result[0].nestedTypes).toHaveLength(1);
			expect(result[0].nestedTypes[0].name.name).toBe("Address");
			expect(result[0].nestedTypes[0].properties).toHaveLength(2);
		});

		test("should parse protocol conformances", () => {
			const input = `
struct User: Codable, Equatable {
  let id: String
}`;
			const parser = new SwiftParser(input);
			const result = parser.parse();

			expect(result).toHaveLength(1);
			expect(result[0].conformances).toEqual(["Codable", "Equatable"]);
		});

		test("should parse properties with default values", () => {
			const input = `
struct Settings {
  var isEnabled: Bool = true
  let maxRetries: Int = 3
}`;
			const parser = new SwiftParser(input);
			const result = parser.parse();

			expect(result).toHaveLength(1);
			expect(result[0].properties[0].defaultValue).toBe("true");
			expect(result[0].properties[1].defaultValue).toBe("3");
		});
	});

	describe("toJsonSchema", () => {
		test("should convert simple struct to JSON schema", () => {
			const input = `
struct User {
  let name: String
  var age: Int
  let isActive: Bool
}`;
			const parser = new SwiftParser(input);
			const ast = parser.parse();
			const schema = parser.toJsonSchema(ast);

			const expected: JsonSchema = {
				type: "object",
				fields: {
					name: { type: "string" },
					age: { type: "number", int: true },
					isActive: { type: "boolean" },
				},
			};

			expect(schema).toEqual(expected);
		});

		test("should handle optional and array types", () => {
			const input = `
struct Contact {
  var phones: [String]
  let email: String?
  let scores: [Int]?
}`;
			const parser = new SwiftParser(input);
			const ast = parser.parse();
			const schema = parser.toJsonSchema(ast);

			const expected: JsonSchema = {
				type: "object",
				fields: {
					phones: { type: "array", itemType: { type: "string" } },
					email: { type: "string", optional: true },
					scores: {
						type: "array",
						itemType: { type: "number", int: true },
						optional: true,
					},
				},
			};

			expect(schema).toEqual(expected);
		});

		test("should handle nested structs", () => {
			const input = `
struct User {
  let name: String
  struct Address {
    var street: String
    let city: String
  }
  let address: Address
}`;
			const parser = new SwiftParser(input);
			const ast = parser.parse();
			const schema = parser.toJsonSchema(ast);

			const expected: JsonSchema = {
				type: "object",
				fields: {
					name: { type: "string" },
					Address: {
						type: "object",
						fields: {
							street: { type: "string" },
							city: { type: "string" },
						},
					},
					address: { type: "object", fields: {} },
				},
			};

			expect(schema).toEqual(expected);
		});

		test("should handle custom types", () => {
			const input = `
struct Order {
  let id: String
  var status: OrderStatus
  let date: Date
}`;
			const parser = new SwiftParser(input);
			const ast = parser.parse();
			const schema = parser.toJsonSchema(ast);

			const expected: JsonSchema = {
				type: "object",
				fields: {
					id: { type: "string" },
					status: { type: "object", fields: {} },
					date: { type: "date" },
				},
			};

			expect(schema).toEqual(expected);
		});
	});

	describe("fromJsonSchema", () => {
		test("should convert simple JSON schema to Swift struct", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					name: { type: "string" },
					age: { type: "number", int: true },
					isActive: { type: "boolean" },
				},
			};

			const parser = new SwiftParser("");
			const result = parser.fromJsonSchema(schema, "User");

			expect(result).toBe(
				`struct User {
    let name: String
    let age: Int
    let isActive: Bool
}`,
			);
		});

		test("should handle optional and array types", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					phones: { type: "array", itemType: { type: "string" } },
					email: { type: "string", optional: true },
					scores: {
						type: "array",
						itemType: { type: "number", int: true },
						optional: true,
					},
				},
			};

			const parser = new SwiftParser("");
			const result = parser.fromJsonSchema(schema, "Contact");

			expect(result).toBe(
				`struct Contact {
    let phones: [String]
    let email: String?
    let scores: [Int]?
}`,
			);
		});

		test("should handle nested objects", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					name: { type: "string" },
					address: {
						type: "object",
						fields: {
							street: { type: "string" },
							city: { type: "string" },
						},
					},
				},
			};

			const parser = new SwiftParser("");
			const result = parser.fromJsonSchema(schema, "User");

			expect(result).toBe(
				`struct User {
    struct Address {
        let street: String
        let city: String
    }

    let name: String
    let address: Address
}`,
			);
		});

		test("should handle all primitive types", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					text: { type: "string" },
					count: { type: "number", int: true },
					amount: { type: "number" },
					isEnabled: { type: "boolean" },
					createdAt: { type: "date" },
					anyValue: { type: "any" },
				},
			};

			const parser = new SwiftParser("");
			const result = parser.fromJsonSchema(schema, "Config");

			expect(result).toBe(
				`struct Config {
    let text: String
    let count: Int
    let amount: Double
    let isEnabled: Bool
    let createdAt: Date
    let anyValue: Any
}`,
			);
		});
	});
});
