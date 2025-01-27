import type { JsonSchema } from "./types";

function getSwiftType(def: JsonSchema, name?: string): string {
	switch (def.type) {
		case "string":
			return "String";
		case "number":
			return def.int ? "Int" : "Double";
		case "boolean":
			return "Bool";
		case "array":
			// If array contains objects, use the custom type name
			if (def.itemType.type === "object") {
				const itemTypeName = name
					? `${capitalize(name)}Item`
					: "AnonymousStruct";
				return `[${itemTypeName}]`;
			}
			return `[${getSwiftType(def.itemType)}]`;
		case "date":
			return "Date";
		case "enum":
			// Use capitalized name for enum type
			return name ? `${capitalize(name)}` : "String";
		case "object":
			// Use capitalized name for nested object type
			return name ? `${capitalize(name)}` : "AnonymousStruct";
		case "literal":
			return typeof def.value === "string"
				? "String"
				: typeof def.value === "number"
					? "Double"
					: "Bool";
		case "any":
		case "unknown":
			return "Any";
		default:
			return "Any";
	}
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSwiftProperty(name: string, schema: JsonSchema): string {
	const type = getSwiftType(schema, name);
	const optionalSuffix = schema.optional || schema.nullable ? "?" : "";

	let defaultValue = "";
	if (schema.defaultValue !== undefined) {
		defaultValue = ` = ${formatDefaultValue(schema.defaultValue, schema)}`;
	}

	return `    var ${name}: ${type}${optionalSuffix}${defaultValue}`;
}

function formatDefaultValue(value: unknown, schema: JsonSchema): string {
	if (value === null) return "nil";
	if (typeof value === "string") return `"${value}"`;
	if (typeof value === "boolean") return value ? "true" : "false";
	if (Array.isArray(value))
		return `[${value.map((v) => formatDefaultValue(v, schema.type === "array" ? schema.itemType : schema)).join(", ")}]`;
	return String(value);
}

function generateSwiftEnum(name: string, schema: JsonSchema): string {
	if (schema.type !== "enum") return "";

	const enumName = capitalize(name);
	const cases = schema.values
		.map((value) => `    case ${formatEnumCase(value)} = "${value}"`)
		.join("\n");

	return `enum ${enumName}: String, Codable {
${cases}
}`;
}

function formatEnumCase(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
}

function generateNestedTypes(
	fields: Record<string, JsonSchema>,
	parentName: string,
): string[] {
	const nestedTypes: string[] = [];

	for (const [key, value] of Object.entries(fields)) {
		if (value.type === "enum") {
			nestedTypes.push(generateSwiftEnum(key, value));
		} else if (value.type === "object") {
			const typeName = `${capitalize(key)}`;
			nestedTypes.push(generateSwiftStruct(value, typeName));
			// Recursively generate nested types
			nestedTypes.push(...generateNestedTypes(value.fields, typeName));
		} else if (value.type === "array" && value.itemType.type === "object") {
			const typeName = `${capitalize(key)}Item`;
			nestedTypes.push(generateSwiftStruct(value.itemType, typeName));
			nestedTypes.push(...generateNestedTypes(value.itemType.fields, typeName));
		}
	}

	return nestedTypes;
}

function generateSwiftStruct(schema: JsonSchema, structName: string): string {
	if (schema.type !== "object") return "";

	const properties = Object.entries(schema.fields)
		.map(([key, value]) => generateSwiftProperty(key, value))
		.join("\n");

	const codingKeys = Object.keys(schema.fields)
		.map((key) => `        case ${key}`)
		.join("\n");

	return `struct ${structName}: Codable {
${properties}

    enum CodingKeys: String, CodingKey {
${codingKeys}
    }
}`;
}

export function jsonToSwiftCode(
	jsonSchema: JsonSchema,
	structName = "MyStruct",
): { success: boolean; data?: string; error?: string } {
	try {
		if (jsonSchema.type !== "object") {
			throw new Error("Root schema must be an object type");
		}

		const nestedTypes = generateNestedTypes(jsonSchema.fields, structName);
		const mainStruct = generateSwiftStruct(jsonSchema, structName);

		const code = [...nestedTypes, mainStruct].join("\n\n");

		return { success: true, data: code };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
