import { describe, test, expect, beforeEach } from "../setup";
import { ZodParser } from "../../parser/zod";
import { testCases, expectedSchemas, expectJsonSchema } from "../setup";
import type { JsonSchema } from "../../types";

describe("ZodParser", () => {
	let parser: ZodParser;

	beforeEach(() => {
		parser = new ZodParser();
	});

	describe("parse", () => {
		test("should parse a simple Zod schema", () => {
			const result = parser.parse(testCases.zod.simpleSchema);
			expect(result).toBeDefined();
			expect(result.type).toBe("ExportNamedDeclaration");
			expect(result.declaration.type).toBe("VariableDeclaration");
		});

		test("should handle complex nested schemas", () => {
			const result = parser.parse(testCases.zod.nestedSchema);
			expect(result).toBeDefined();
			expect(result.type).toBe("ExportNamedDeclaration");
		});
	});

	describe("toJsonSchema", () => {
		test("should convert simple schema to JSON schema", () => {
			const ast = parser.parse(testCases.zod.simpleSchema);
			const jsonSchema = parser.toJsonSchema(ast);
			expectJsonSchema(jsonSchema, expectedSchemas.simpleUser);
		});

		test("should convert nested schema to JSON schema", () => {
			const ast = parser.parse(testCases.zod.nestedSchema);
			const jsonSchema = parser.toJsonSchema(ast);
			expectJsonSchema(jsonSchema, expectedSchemas.nestedUser);
		});
	});

	describe("validate", () => {
		test("should validate valid AST", () => {
			const ast = parser.parse(testCases.zod.simpleSchema);
			const result = parser.validate(ast);
			expect(result.success).toBe(true);
			expect(result.errors).toBeUndefined();
		});

		test("should return errors for invalid AST", () => {
			const invalidAst = {
				type: "ExportNamedDeclaration",
				declaration: {
					type: "InvalidType",
				},
			};

			const result = parser.validate(invalidAst as any);
			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors?.length).toBeGreaterThan(0);
		});
	});

	describe("fromJsonSchema", () => {
		test("should convert simple JSON schema to Zod schema", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					name: { type: "string" },
					age: { type: "number", int: true },
					isActive: { type: "boolean" },
				},
			};

			const result = parser.fromJsonSchema(schema, "userSchema");
			expect(result).toBe(
				`import { z } from "zod";

export const userSchema = z.object({
  name: z.string(),
  age: z.number().int(),
  isActive: z.boolean()
});

export type userSchemaType = z.infer<typeof userSchema>;
`,
			);
		});

		test("should handle optional and array types", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					tags: { type: "array", itemType: { type: "string" } },
					email: { type: "string", optional: true, email: true },
					scores: {
						type: "array",
						itemType: { type: "number", int: true },
						optional: true,
					},
				},
			};

			const result = parser.fromJsonSchema(schema, "contactSchema");
			expect(result).toBe(
				`import { z } from "zod";

export const contactSchema = z.object({
  tags: z.array(z.string()),
  email: z.string().email().optional(),
  scores: z.array(z.number().int()).optional()
});

export type contactSchemaType = z.infer<typeof contactSchema>;
`,
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

			const result = parser.fromJsonSchema(schema, "userSchema");
			expect(result).toBe(
				`import { z } from "zod";

export const userSchema = z.object({
  name: z.string(),
  address: z.object({
  street: z.string(),
  city: z.string()
})
});

export type userSchemaType = z.infer<typeof userSchema>;
`,
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
					unknownValue: { type: "unknown" },
				},
			};

			const result = parser.fromJsonSchema(schema, "configSchema");
			expect(result).toBe(
				`import { z } from "zod";

export const configSchema = z.object({
  text: z.string(),
  count: z.number().int(),
  amount: z.number(),
  isEnabled: z.boolean(),
  createdAt: z.date(),
  anyValue: z.any(),
  unknownValue: z.unknown()
});

export type configSchemaType = z.infer<typeof configSchema>;
`,
			);
		});

		test("should handle unions and enums", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					status: { type: "enum", values: ["active", "inactive", "pending"] },
					data: {
						type: "union",
						variants: [{ type: "string" }, { type: "number" }],
					},
				},
			};

			const result = parser.fromJsonSchema(schema, "statusSchema");
			expect(result).toBe(
				`import { z } from "zod";

export const statusSchema = z.object({
  status: z.enum(["active", "inactive", "pending"]),
  data: z.union([z.string(), z.number()])
});

export type statusSchemaType = z.infer<typeof statusSchema>;
`,
			);
		});

		test("should handle descriptions with special characters", () => {
			const schema: JsonSchema = {
				type: "object",
				fields: {
					isValid: {
						type: "boolean",
						description: "Whether the plant was successfully identified"
					},
					score: {
						type: "number",
						description: "Score: 0-100%"
					},
					notes: {
						type: "string",
						description: "User's notes & special chars"
					}
				}
			};

			const result = parser.fromJsonSchema(schema, "validationSchema");
			const expected = `import { z } from "zod";

export const validationSchema = z.object({
  isValid: z.boolean().describe("Whether the plant was successfully identified"),
  score: z.number().describe("Score: 0-100%"),
  notes: z.string().describe("User's notes & special chars")
});

export type validationSchemaType = z.infer<typeof validationSchema>;
`;
			expect(result).toBe(expected);
		});
	});
});
