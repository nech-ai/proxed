import { expect } from "bun:test";
import type { JsonSchema } from "../types";

// Test utilities
export function expectJsonSchema(actual: JsonSchema, expected: JsonSchema) {
	expect(actual).toEqual(expected);
}

export function expectSuccess<T>(
	result: { success: boolean; data?: T; errors?: any[] },
	expected?: T,
) {
	expect(result.success).toBe(true);
	expect(result.errors).toBeUndefined();
	if (expected) {
		expect(result.data).toEqual(expected);
	}
}

export function expectError(
	result: { success: boolean; errors?: any[] },
	message?: string,
) {
	expect(result.success).toBe(false);
	expect(result.errors).toBeDefined();
	if (message) {
		expect(result.errors![0].message).toContain(message);
	}
}

// Test data
export const testCases = {
	zod: {
		simpleSchema: `import { z } from "zod";

export const userSchema = z.object({
	name: z.string(),
	age: z.number().int()
});`,
		complexSchema: `import { z } from "zod";

export const schema = z.object({
	email: z.email(),
	age: z.number().min(18).max(100),
	tags: z.array(z.string()),
	status: z.enum(["active", "inactive"])
});`,
		nestedSchema: `import { z } from "zod";

export const userSchema = z.object({
	name: z.string(),
	address: z.object({
		street: z.string(),
		city: z.string()
	})
});`,
		arraySchema: `import { z } from "zod";

export const schema = z.object({
	tags: z.array(z.string()),
	scores: z.array(z.number())
});`,
		optionalSchema: `import { z } from "zod";

export const schema = z.object({
	name: z.string(),
	email: z.email().optional(),
	age: z.number().nullable(),
	tags: z.array(z.string()).optional()
});`,
	},
};

export const expectedSchemas = {
	simpleUser: {
		type: "object",
		fields: {
			name: { type: "string" },
			age: { type: "number", int: true },
		},
	} as JsonSchema,
	nestedUser: {
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
	} as JsonSchema,
};
