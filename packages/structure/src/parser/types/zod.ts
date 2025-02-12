import type { Node, Identifier } from "./base";

export interface CallExpression extends Node {
	type: "CallExpression";
	callee: MemberExpression | Identifier;
	arguments: Expression[];
}

export interface MemberExpression extends Node {
	type: "MemberExpression";
	object: Expression;
	property: Identifier;
}

export interface ObjectExpression extends Node {
	type: "ObjectExpression";
	properties: Property[];
}

export interface ArrayExpression extends Node {
	type: "ArrayExpression";
	elements: Expression[];
}

export interface Property extends Node {
	type: "Property";
	key: Identifier;
	value: Expression;
}

export interface Literal extends Node {
	type: "Literal";
	value: string | number | boolean | null;
}

export interface VariableDeclaration extends Node {
	type: "VariableDeclaration";
	declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends Node {
	type: "VariableDeclarator";
	id: Identifier;
	init: Expression;
}

export interface ExportNamedDeclaration extends Node {
	type: "ExportNamedDeclaration";
	declaration: VariableDeclaration;
}

export type Expression =
	| CallExpression
	| ObjectExpression
	| ArrayExpression
	| Literal
	| MemberExpression
	| Identifier;
