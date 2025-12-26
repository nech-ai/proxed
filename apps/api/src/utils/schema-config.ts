import type { JsonSchema, SchemaType } from "@proxed/structure";

const schemaTypes: SchemaType[] = [
	"object",
	"string",
	"number",
	"boolean",
	"array",
	"union",
	"intersection",
	"enum",
	"literal",
	"date",
	"any",
	"unknown",
	"record",
	"branded",
	"promise",
	"lazy",
];

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isSchemaType(value: unknown): value is SchemaType {
	return (
		typeof value === "string" &&
		schemaTypes.some((schemaType) => schemaType === value)
	);
}

function isJsonSchema(value: unknown): value is JsonSchema {
	return isRecord(value) && isSchemaType(value.type);
}

export function parseSchemaConfig(value: unknown): {
	schema: JsonSchema;
	title?: string;
	description?: string;
} | null {
	const metadata = isRecord(value)
		? {
				title: typeof value.title === "string" ? value.title : undefined,
				description:
					typeof value.description === "string" ? value.description : undefined,
			}
		: {};

	if (!isJsonSchema(value)) {
		return null;
	}

	return {
		schema: value,
		...metadata,
	};
}
