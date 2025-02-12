import type { Node } from "./base";

export interface Identifier extends Node {
	type: "Identifier";
	name: string;
}

export interface TypeAnnotation extends Node {
	type: "TypeAnnotation";
	name: string;
	isOptional: boolean;
	isArray: boolean;
}

export interface PropertyDeclaration extends Node {
	type: "PropertyDeclaration";
	name: Identifier;
	typeAnnotation: TypeAnnotation;
	defaultValue?: string;
	isVariable: boolean;
}

export interface StructDeclaration extends Node {
	type: "StructDeclaration";
	name: Identifier;
	properties: PropertyDeclaration[];
	nestedTypes: StructDeclaration[];
	conformances: string[];
}

export interface ZodTypeAnnotation extends Node {
	type: "ZodTypeAnnotation";
	name: string;
	isOptional: boolean;
	isArray: boolean;
	validations?: Record<string, any>;
}

export interface ZodPropertyDeclaration extends Node {
	type: "ZodPropertyDeclaration";
	name: Identifier;
	typeAnnotation: ZodTypeAnnotation;
	description?: string;
}

export interface ZodSchemaDeclaration extends Node {
	type: "ZodSchemaDeclaration";
	name: Identifier;
	properties: ZodPropertyDeclaration[];
	description?: string;
}
