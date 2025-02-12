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
	| "unknown"
	| "record"
	| "branded"
	| "promise"
	| "lazy";

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
	errorMap?: Record<string, string | ((params: any) => string)>;
	refinements?: Array<{
		message?: string;
		code?: string;
		validation: string;
	}>;
	transformations?: Array<{
		transform: string;
	}>;
	preprocess?: {
		type: "string" | "number" | "boolean" | "date";
		coerce: boolean;
	};
}

export interface StringJsonSchema extends BaseJsonSchema {
	type: "string";
	minLength?: number;
	maxLength?: number;
	length?: number;
	regex?: string;
	email?: boolean;
	url?: boolean;
	uuid?: boolean;
	cuid?: boolean;
	cuid2?: boolean;
	ulid?: boolean;
	emoji?: boolean;
	ip?: boolean;
	datetime?: boolean;
	startsWith?: string;
	endsWith?: string;
	trim?: boolean;
	toLowerCase?: boolean;
	toUpperCase?: boolean;
}

export interface NumberJsonSchema extends BaseJsonSchema {
	type: "number";
	min?: number;
	max?: number;
	int?: boolean;
	finite?: boolean;
	safe?: boolean;
	positive?: boolean;
	negative?: boolean;
	nonpositive?: boolean;
	nonnegative?: boolean;
	multipleOf?: number;
}

export interface BooleanJsonSchema extends BaseJsonSchema {
	type: "boolean";
}

export interface ArrayJsonSchema extends BaseJsonSchema {
	type: "array";
	itemType: JsonSchema;
	minItems?: number;
	maxItems?: number;
	length?: number;
	nonempty?: boolean;
}

export interface ObjectJsonSchema extends BaseJsonSchema {
	type: "object";
	fields: Record<string, JsonSchema>;
	strict?: boolean;
	strip?: boolean;
	catchall?: JsonSchema;
	partial?: boolean;
	deepPartial?: boolean;
	pick?: string[];
	omit?: string[];
	extend?: JsonSchema;
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

export interface RecordJsonSchema extends BaseJsonSchema {
	type: "record";
	keySchema: JsonSchema;
	valueSchema: JsonSchema;
}

export interface BrandedJsonSchema extends BaseJsonSchema {
	type: "branded";
	brand: string;
	baseSchema: JsonSchema;
}

export interface PromiseJsonSchema extends BaseJsonSchema {
	type: "promise";
	valueSchema: JsonSchema;
}

export interface LazyJsonSchema extends BaseJsonSchema {
	type: "lazy";
	getter: string;
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
	| UnknownJsonSchema
	| RecordJsonSchema
	| BrandedJsonSchema
	| PromiseJsonSchema
	| LazyJsonSchema;

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
