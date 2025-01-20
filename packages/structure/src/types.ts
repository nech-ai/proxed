import type { z } from "zod";

export type SchemaType =
	| "object"
	| "string"
	| "number"
	| "boolean"
	| "array"
	| "union"
	| "intersection"
	| "enum"
	| "literal"
	| "date"
	| "any"
	| "unknown";

export interface BaseJsonSchema {
	type: SchemaType;
	description?: string;
	optional?: boolean;
	nullable?: boolean;
	defaultValue?: unknown;
}

export interface StringJsonSchema extends BaseJsonSchema {
	type: "string";
	minLength?: number;
	maxLength?: number;
	regex?: string;
	email?: boolean;
	url?: boolean;
	uuid?: boolean;
}

export interface NumberJsonSchema extends BaseJsonSchema {
	type: "number";
	min?: number;
	max?: number;
	int?: boolean;
}

export interface BooleanJsonSchema extends BaseJsonSchema {
	type: "boolean";
}

export interface ArrayJsonSchema extends BaseJsonSchema {
	type: "array";
	itemType: JsonSchema;
	minItems?: number;
	maxItems?: number;
}

export interface ObjectJsonSchema extends BaseJsonSchema {
	type: "object";
	fields: Record<string, JsonSchema>;
}

export interface UnionJsonSchema extends BaseJsonSchema {
	type: "union";
	variants: JsonSchema[];
}

export interface IntersectionJsonSchema extends BaseJsonSchema {
	type: "intersection";
	allOf: JsonSchema[];
}

export interface EnumJsonSchema extends BaseJsonSchema {
	type: "enum";
	values: string[];
}

export interface LiteralJsonSchema extends BaseJsonSchema {
	type: "literal";
	value: string | number | boolean;
}

export interface DateJsonSchema extends BaseJsonSchema {
	type: "date";
}

export interface AnyJsonSchema extends BaseJsonSchema {
	type: "any";
}

export interface UnknownJsonSchema extends BaseJsonSchema {
	type: "unknown";
}

export type JsonSchema =
	| StringJsonSchema
	| NumberJsonSchema
	| BooleanJsonSchema
	| ArrayJsonSchema
	| ObjectJsonSchema
	| UnionJsonSchema
	| IntersectionJsonSchema
	| EnumJsonSchema
	| LiteralJsonSchema
	| DateJsonSchema
	| AnyJsonSchema
	| UnknownJsonSchema;

export type ZodToJsonResult = {
	success: boolean;
	data?: JsonSchema;
	error?: string;
};

export type JsonToZodResult = {
	success: boolean;
	data?: z.ZodTypeAny;
	error?: string;
};

export interface ZodCodeResult {
	success: boolean;
	data?: string;
	error?: string;
}

export interface ZodCodeToJsonResult {
	success: boolean;
	data?: JsonSchema;
	error?: string;
}
