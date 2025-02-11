import type { z } from "zod";
import { ZodParser } from "../parser/zod";
import type { JsonSchema } from "../types";
import { expect, test, describe, afterAll, beforeAll } from "bun:test";
import {
	writeFileSync,
	unlinkSync,
	mkdirSync,
	existsSync,
	rmdirSync,
} from "node:fs";
import { join } from "node:path";

describe("Zod Validation Cycle", () => {
	const parser = new ZodParser();
	const tempDir = join(process.cwd(), "temp");
	const validatorPath = join(tempDir, "validator.ts");

	// Create temp directory before tests
	beforeAll(() => {
		if (!existsSync(tempDir)) {
			mkdirSync(tempDir, { recursive: true });
		}
	});

	// Helper function to create and load a validator module
	const loadValidator = (jsonSchema: JsonSchema) => {
		// Generate validator code
		const validatorCode = parser.createValidator(jsonSchema);

		// Write to temporary file
		writeFileSync(validatorPath, validatorCode);

		// Import and return the validator
		const validator = require(validatorPath);
		return validator;
	};

	// Cleanup after tests
	afterAll(() => {
		try {
			unlinkSync(validatorPath);
			rmdirSync(tempDir);
		} catch (e) {
			// Ignore cleanup errors
		}
	});

	test("should handle full validation cycle", () => {
		// 1. Create a JSON Schema directly
		const jsonSchema: JsonSchema = {
			type: "object",
			fields: {
				name: {
					type: "string",
					minLength: 2,
					maxLength: 50,
				},
				age: {
					type: "number",
					int: true,
					min: 0,
					max: 120,
				},
				email: {
					type: "string",
					email: true,
				},
				tags: {
					type: "array",
					itemType: { type: "string" },
					minItems: 1,
				},
				settings: {
					type: "object",
					optional: true,
					fields: {
						notifications: {
							type: "boolean",
						},
						theme: {
							type: "enum",
							values: ["light", "dark"],
							defaultValue: "light",
						},
					},
				},
			},
		};

		// 2. Convert JSON Schema to Zod validator
		const validator = parser.convertJsonSchemaToZodValidator(jsonSchema);

		// 3. Test validation with valid data
		const validData = {
			name: "John Doe",
			age: 30,
			email: "john@example.com",
			tags: ["user", "premium"],
			settings: {
				notifications: true,
				theme: "dark",
			},
		};

		const validResult = validator.safeParse(validData);
		expect(validResult.success).toBe(true);

		// 4. Test validation with invalid data
		const invalidData = {
			name: "J", // too short
			age: 150, // too high
			email: "not-an-email",
			tags: [], // empty array
			settings: {
				notifications: "yes", // should be boolean
				theme: "blue", // invalid enum value
			},
		};

		const invalidResult = validator.safeParse(invalidData);
		expect(invalidResult.success).toBe(false);
		if (!invalidResult.success) {
			const errors = invalidResult.error.errors;
			expect(errors).toEqual([
				{
					code: "too_small",
					minimum: 2,
					type: "string",
					inclusive: true,
					exact: false,
					message: "String must contain at least 2 character(s)",
					path: ["name"],
				},
				{
					code: "too_big",
					maximum: 120,
					type: "number",
					inclusive: true,
					exact: false,
					message: "Number must be less than or equal to 120",
					path: ["age"],
				},
				{
					code: "invalid_string",
					validation: "email",
					message: "Invalid email",
					path: ["email"],
				},
				{
					code: "invalid_type",
					expected: "boolean",
					received: "string",
					message: "Expected boolean, received string",
					path: ["settings", "notifications"],
				},
				{
					code: "invalid_enum_value",
					options: ["light", "dark"],
					received: "blue",
					message:
						"Invalid enum value. Expected 'light' | 'dark', received 'blue'",
					path: ["settings", "theme"],
				},
			]);
		}

		// 5. Test throw behavior
		expect(() => validator.parse(invalidData)).toThrow();
	});

	test("should handle nested arrays and optional fields", () => {
		// 1. Create a JSON Schema directly
		const jsonSchema: JsonSchema = {
			type: "object",
			fields: {
				users: {
					type: "array",
					itemType: {
						type: "object",
						fields: {
							id: {
								type: "number",
							},
							roles: {
								type: "array",
								itemType: {
									type: "enum",
									values: ["admin", "user", "guest"],
								},
							},
							profile: {
								type: "object",
								fields: {
									avatar: {
										type: "string",
										url: true,
										optional: true,
									},
									bio: {
										type: "string",
										maxLength: 500,
										nullable: true,
									},
								},
							},
						},
					},
				},
			},
		};

		const validator = parser.convertJsonSchemaToZodValidator(jsonSchema);

		// Test valid data
		const validData = {
			users: [
				{
					id: 1,
					roles: ["admin", "user"],
					profile: {
						avatar: "https://example.com/avatar.jpg",
						bio: null,
					},
				},
				{
					id: 2,
					roles: ["guest"],
					profile: {
						bio: "Hello world",
					},
				},
			],
		};

		const validResult = validator.safeParse(validData);
		expect(validResult.success).toBe(true);

		// Test invalid data
		const invalidData = {
			users: [
				{
					id: "1", // should be number
					roles: ["superuser"], // invalid role
					profile: {
						avatar: "not-a-url",
						bio: 123, // should be string or null
					},
				},
			],
		};

		const invalidResult = validator.safeParse(invalidData);
		expect(invalidResult.success).toBe(false);
		if (!invalidResult.success) {
			expect(invalidResult.error.errors.length).toBeGreaterThan(0);
		}

		// Test throw behavior
		expect(() => validator.parse(invalidData)).toThrow();
	});
});
