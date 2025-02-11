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

export interface ValidationError {
	path: string[];
	message: string;
}

export interface SchemaResult<T> {
	success: boolean;
	data?: T;
	errors?: ValidationError[];
}

export interface ValidationOptions {
	strict?: boolean;
	coerce?: boolean;
	maxDepth?: number;
}

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

// Type Guards
export function isObjectSchema(schema: JsonSchema): schema is ObjectJsonSchema {
	return schema.type === "object";
}

export function isArraySchema(schema: JsonSchema): schema is ArrayJsonSchema {
	return schema.type === "array";
}

export function isStringSchema(schema: JsonSchema): schema is StringJsonSchema {
	return schema.type === "string";
}

export function isNumberSchema(schema: JsonSchema): schema is NumberJsonSchema {
	return schema.type === "number";
}

export function isUnionSchema(schema: JsonSchema): schema is UnionJsonSchema {
	return schema.type === "union";
}

export function isIntersectionSchema(
	schema: JsonSchema,
): schema is IntersectionJsonSchema {
	return schema.type === "intersection";
}

export type ZodToJsonResult = SchemaResult<JsonSchema>;
export type JsonToZodResult = SchemaResult<z.ZodTypeAny>;
export type ZodCodeResult = SchemaResult<string>;
export type ZodCodeToJsonResult = SchemaResult<JsonSchema>;
export type SwiftCodeResult = SchemaResult<string>;
export type SwiftCodeToJsonResult = SchemaResult<JsonSchema>;

export interface SwiftProperty {
	name: string;
	type: string;
	optional: boolean;
	isArray: boolean;
	defaultValue?: string;
}

export interface SwiftStruct {
	name: string;
	properties: SwiftProperty[];
	nestedTypes?: SwiftStruct[];
	codingKeys?: string[];
}

export interface SchemaConverter<T> {
	toJson(input: string): Promise<JsonSchemaResult>;
	fromJson(schema: JsonSchema): Promise<CodeGenerationResult<T>>;
	validate(input: string, schema: JsonSchema): Promise<ValidationResult>;
}

export interface CodeGenerationResult<T> {
	success: boolean;
	data?: T;
	errors?: Array<{
		path: string[];
		message: string;
	}>;
}

export interface ValidationResult {
	success: boolean;
	errors?: Array<{
		path: string[];
		message: string;
	}>;
}

export interface JsonSchemaResult {
	success: boolean;
	data?: JsonSchema;
	errors?: Array<{
		path: string[];
		message: string;
	}>;
}
