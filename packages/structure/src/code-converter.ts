import { z } from "zod";
import { zodToJson } from "./generator";
import type { ZodCodeResult, ZodCodeToJsonResult, JsonSchema } from "./types";

/**
 * Applies common decorators such as .describe(), .optional(), .nullable(), .default().
 */
function applyDecorators(base: string, def: JsonSchema): string {
	let code = base;

	if (def.description) {
		code += `.describe("${def.description}")`;
	}
	if (def.optional) {
		code += ".optional()";
	}
	if (def.nullable) {
		code += ".nullable()";
	}
	if (def.defaultValue !== undefined) {
		code += `.default(${JSON.stringify(def.defaultValue)})`;
	}

	return code;
}

/**
 * Builds the base snippet (without decorators) for each Zod type.
 */
function buildBaseSnippet(
	def: JsonSchema,
	recurse: (d: JsonSchema) => string,
): string {
	switch (def.type) {
		case "string": {
			let code = "z.string()";
			if (def.minLength !== undefined) code += `.min(${def.minLength})`;
			if (def.maxLength !== undefined) code += `.max(${def.maxLength})`;
			if (def.email) code += ".email()";
			if (def.url) code += ".url()";
			if (def.uuid) code += ".uuid()";
			if (def.regex) code += `.regex(new RegExp("${def.regex}"))`;
			return code;
		}

		case "number": {
			let code = "z.number()";
			if (def.min !== undefined) code += `.min(${def.min})`;
			if (def.max !== undefined) code += `.max(${def.max})`;
			if (def.int) code += ".int()";
			return code;
		}

		case "boolean":
			return "z.boolean()";

		case "array": {
			let code = `z.array(${recurse(def.itemType)})`;
			if (def.minLength !== undefined) code += `.min(${def.minLength})`;
			if (def.maxLength !== undefined) code += `.max(${def.maxLength})`;
			return code;
		}

		case "object": {
			const fields = Object.entries(def.fields)
				.map(([key, value]) => `${key}: ${recurse(value)}`)
				.join(",\n    ");
			return `z.object({\n    ${fields}\n  })`;
		}

		case "union": {
			const variants = def.variants.map((v) => recurse(v)).join(", ");
			return `z.union([${variants}])`;
		}

		case "intersection": {
			const { allOf } = def;
			if (!allOf?.length) return "z.any()";
			if (allOf.length === 1) return recurse(allOf[0]);
			const snippets = allOf.map((s) => recurse(s));
			return snippets.reduce((acc, cur) => `z.intersection(${acc}, ${cur})`);
		}

		case "enum":
			return `z.enum([${def.values.map((v) => `"${v}"`).join(", ")}])`;

		case "literal":
			return typeof def.value === "string"
				? `z.literal("${def.value}")`
				: `z.literal(${def.value})`;

		case "date":
			return "z.date()";

		default:
			return "z.any()";
	}
}

/**
 * Recursively generates a Zod snippet string for a given JsonSchema definition.
 */
function generateZodSnippet(def: JsonSchema): string {
	const baseSnippet = buildBaseSnippet(def, generateZodSnippet);
	return applyDecorators(baseSnippet, def);
}

type Context = {
	z: typeof z;
	exports: Record<string, unknown>;
};

/**
 * Converts a JSON schema definition into TypeScript Zod code.
 */
export function jsonToZodCode(
	jsonSchema: JsonSchema,
	schemaName = "mySchema",
): ZodCodeResult {
	try {
		const lines = [
			'import { z } from "zod";',
			"",
			`export const ${schemaName} = ${generateZodSnippet(jsonSchema)};`,
			"",
			`export type ${schemaName}Type = z.infer<typeof ${schemaName}>;`,
			"",
		];

		return { success: true, data: lines.join("\n") };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Converts Zod TypeScript code into a JSON schema definition.
 * WARNING: Uses new Function() for evaluation. In production, use TypeScript Compiler API.
 */
export function zodCodeToJson(
	zodCode: string,
	schemaExportName = "mySchema",
): ZodCodeToJsonResult {
	try {
		const context: Context = { z, exports: {} };
		const cleanCode = zodCode
			.replace(/import\s*{[^}]*}\s*from\s*['"]zod['"];?/g, "")
			.replace(/export\s+const\s+/g, "exports.")
			.replace(/^\s+/gm, "")
			.replace(/\s+$/gm, "")
			.replace(/\n+/g, "\n")
			.trim();

		const fn = new Function("z", "exports", cleanCode);
		fn(z, context.exports);

		const schema = context.exports[schemaExportName];
		if (!schema || !(schema instanceof z.ZodType)) {
			throw new Error(`Export "${schemaExportName}" not found or invalid`);
		}

		return zodToJson(schema);
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
