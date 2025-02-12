import type {
	JsonSchema,
	ArrayJsonSchema,
	ObjectJsonSchema,
	UnionJsonSchema,
	IntersectionJsonSchema,
	EnumJsonSchema,
	LiteralJsonSchema,
	NumberJsonSchema,
} from "../../types";

const validationBuilders = {
	string: (schema: JsonSchema): string => {
		let code = "z.string()";
		if ("minLength" in schema && schema.minLength !== undefined)
			code += `.min(${schema.minLength})`;
		if ("maxLength" in schema && schema.maxLength !== undefined)
			code += `.max(${schema.maxLength})`;
		if ("email" in schema && schema.email) code += ".email()";
		if ("url" in schema && schema.url) code += ".url()";
		if ("uuid" in schema && schema.uuid) code += ".uuid()";
		if ("regex" in schema && schema.regex)
			code += `.regex(new RegExp("${schema.regex}"))`;
		return code;
	},

	number: (schema: JsonSchema): string => {
		let code = "z.number()";
		if ("min" in schema && schema.min !== undefined)
			code += `.min(${schema.min})`;
		if ("max" in schema && schema.max !== undefined)
			code += `.max(${schema.max})`;
		if ("int" in schema && schema.int) code += ".int()";
		return code;
	},

	array: (
		schema: ArrayJsonSchema,
		generateSnippet: (def: JsonSchema) => string,
	): string => {
		let code = `z.array(${generateSnippet(schema.itemType)})`;
		if (schema.minItems !== undefined) code += `.min(${schema.minItems})`;
		if (schema.maxItems !== undefined) code += `.max(${schema.maxItems})`;
		return code;
	},

	object: (
		schema: ObjectJsonSchema,
		generateSnippet: (def: JsonSchema) => string,
	): string => {
		const fields = Object.entries(schema.fields)
			.map(([key, value]) => `${key}: ${generateSnippet(value)}`)
			.join(",\n  ");
		return `z.object({\n  ${fields}\n})`;
	},

	union: (
		schema: UnionJsonSchema,
		generateSnippet: (def: JsonSchema) => string,
	): string => {
		const variants = schema.variants.map((v) => generateSnippet(v)).join(", ");
		return `z.union([${variants}])`;
	},

	intersection: (
		schema: IntersectionJsonSchema,
		generateSnippet: (def: JsonSchema) => string,
	): string => {
		const [first, ...rest] = schema.allOf;
		return rest.reduce(
			(acc, cur) => `${acc}.and(${generateSnippet(cur)})`,
			generateSnippet(first),
		);
	},

	enum: (schema: EnumJsonSchema): string => {
		const values = schema.values.map((v) => `"${v}"`).join(", ");
		return `z.enum([${values}])`;
	},

	literal: (schema: LiteralJsonSchema): string => {
		const value =
			typeof schema.value === "string" ? `"${schema.value}"` : schema.value;
		return `z.literal(${value})`;
	},
};

export function generateZodSnippet(def: JsonSchema): string {
	let code: string;

	switch (def.type) {
		case "string":
			code = validationBuilders.string(def);
			break;
		case "number":
			code = validationBuilders.number(def);
			break;
		case "boolean":
			code = "z.boolean()";
			break;
		case "array":
			code = validationBuilders.array(
				def as ArrayJsonSchema,
				generateZodSnippet,
			);
			break;
		case "object":
			code = validationBuilders.object(
				def as ObjectJsonSchema,
				generateZodSnippet,
			);
			break;
		case "union":
			code = validationBuilders.union(
				def as UnionJsonSchema,
				generateZodSnippet,
			);
			break;
		case "intersection":
			code = validationBuilders.intersection(
				def as IntersectionJsonSchema,
				generateZodSnippet,
			);
			break;
		case "enum":
			code = validationBuilders.enum(def as EnumJsonSchema);
			break;
		case "literal":
			code = validationBuilders.literal(def as LiteralJsonSchema);
			break;
		case "date":
			code = "z.date()";
			break;
		default:
			code = "z.any()";
	}

	if (def.description) code += `.describe("${def.description}")`;
	if (def.optional) code += ".optional()";
	if (def.nullable) code += ".nullable()";
	if (def.defaultValue !== undefined)
		code += `.default(${JSON.stringify(def.defaultValue)})`;

	return code;
}
