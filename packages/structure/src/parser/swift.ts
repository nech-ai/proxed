import { BaseParser, type ParserOptions } from "./base";
import { createTokenRegex } from "./utils";
import type { ValidationResult } from "../types";
import type {
	Identifier,
	TypeAnnotation,
	PropertyDeclaration,
	StructDeclaration,
} from "./types/swift";
import type { JsonSchema } from "../types";

const SWIFT_TOKEN_PATTERNS = [
	// Keywords
	"\\b(?:struct|let|var|true|false)\\b",
	// Identifiers (must come after keywords)
	"[a-zA-Z_][a-zA-Z0-9_]*",
	// Punctuation
	"[{}\\[\\],]",
	// Operators
	"[=:?]",
	// String literals
	'"[^"]*"',
	// Numbers
	"\\d+(?:\\.\\d+)?",
	// Whitespace
	"\\s+",
];

export class SwiftParser extends BaseParser<StructDeclaration[]> {
	private static readonly TOKEN_REGEX = createTokenRegex(SWIFT_TOKEN_PATTERNS);

	constructor(input: string) {
		super({
			strict: true,
		});
		this.initializeTokenizer(input, SwiftParser.TOKEN_REGEX);
	}

	private parseIdentifier(): Identifier {
		this.skipWhitespace();
		const token = this.consume();
		if (!token || (token.type !== "identifier" && token.type !== "keyword")) {
			this.throwError(
				`Expected identifier but got ${token?.type || "end of input"}`,
			);
		}
		return {
			type: "Identifier",
			name: token.value,
			start: token.start,
			end: token.end,
		};
	}

	private parseTypeAnnotation(): TypeAnnotation {
		this.skipWhitespace();
		let isArray = false;
		let isOptional = false;
		let name: string;

		if (this.peek()?.value === "[") {
			this.consume(); // [
			const typeToken = this.consume();
			if (
				!typeToken ||
				(typeToken.type !== "identifier" && typeToken.type !== "keyword")
			) {
				this.throwError("Expected type name after [");
			}
			name = typeToken.value;
			const closeBracket = this.consume();
			if (!closeBracket || closeBracket.value !== "]") {
				this.throwError("Expected ] after array type");
			}
			isArray = true;
		} else {
			const typeToken = this.consume();
			if (
				!typeToken ||
				(typeToken.type !== "identifier" && typeToken.type !== "keyword")
			) {
				this.throwError("Expected type name");
			}
			name = typeToken.value;
		}

		const next = this.peek();
		if (next?.value === "?") {
			this.consume();
			isOptional = true;
		}

		return {
			type: "TypeAnnotation",
			name,
			isOptional,
			isArray,
			start: this.getCurrentPosition().column - 1,
			end: this.getCurrentPosition().column,
		};
	}

	private parsePropertyDeclaration(): PropertyDeclaration {
		this.skipWhitespace();
		const startPos = this.getCurrentPosition().column;
		const keyword = this.consume();
		if (!keyword || (keyword.value !== "var" && keyword.value !== "let")) {
			this.throwError("Expected var or let");
		}
		const isVariable = keyword.value === "var";

		const name = this.parseIdentifier();
		const colon = this.consume();
		if (!colon || colon.value !== ":") {
			this.throwError("Expected : after property name");
		}

		const typeAnnotation = this.parseTypeAnnotation();
		let defaultValue: string | undefined;

		this.skipWhitespace();
		const next = this.peek();
		if (next?.value === "=") {
			this.consume(); // =
			this.skipWhitespace();
			const valueToken = this.consume();
			if (!valueToken) {
				this.throwError("Expected default value after =");
			}
			defaultValue = valueToken.value;
		}

		return {
			type: "PropertyDeclaration",
			name,
			typeAnnotation,
			defaultValue,
			isVariable,
			start: startPos,
			end: this.getCurrentPosition().column,
		};
	}

	private parseStructDeclaration(): StructDeclaration {
		this.skipWhitespace();
		const startPos = this.getCurrentPosition().column;
		const structToken = this.consume();
		if (!structToken || structToken.value !== "struct") {
			this.throwError("Expected struct keyword");
		}

		const name = this.parseIdentifier();
		const conformances: string[] = [];

		this.skipWhitespace();
		const next = this.peek();
		if (next?.value === ":") {
			this.consume();
			this.skipWhitespace();
			let hasMoreConformances = true;
			while (hasMoreConformances) {
				const conformance = this.consume();
				if (
					!conformance ||
					(conformance.type !== "identifier" && conformance.type !== "keyword")
				) {
					this.throwError("Expected protocol name");
				}
				conformances.push(conformance.value);
				this.skipWhitespace();
				const next = this.peek();
				hasMoreConformances = next?.value === ",";
				if (hasMoreConformances) {
					this.consume();
					this.skipWhitespace();
				}
			}
		}

		this.skipWhitespace();
		const openBrace = this.consume();
		if (!openBrace || openBrace.value !== "{") {
			this.throwError("Expected { after struct declaration");
		}

		const properties: PropertyDeclaration[] = [];
		const nestedTypes: StructDeclaration[] = [];

		while (this.peek() && this.peek()?.value !== "}") {
			this.skipWhitespace();
			const token = this.peek();

			if (!token) {
				this.throwError("Unexpected end of input while parsing struct");
			}

			if (token.value === "struct") {
				nestedTypes.push(this.parseStructDeclaration());
			} else if (token.value === "var" || token.value === "let") {
				properties.push(this.parsePropertyDeclaration());
			} else if (token.type === "whitespace") {
				this.consume(); // Skip pure whitespace
			} else if (token.value !== "}") {
				this.throwError(
					`Unexpected token "${token.value}" in struct declaration`,
				);
			}
		}

		const closeBrace = this.consume();
		if (!closeBrace || closeBrace.value !== "}") {
			this.throwError("Expected } at end of struct declaration");
		}

		return {
			type: "StructDeclaration",
			name,
			properties,
			nestedTypes,
			conformances,
			start: startPos,
			end: this.getCurrentPosition().column,
		};
	}

	parse(): StructDeclaration[] {
		const structs: StructDeclaration[] = [];
		while (this.peek()) {
			this.skipWhitespace();
			const token = this.peek();
			if (!token) break;

			if (token.value === "struct") {
				structs.push(this.parseStructDeclaration());
			} else {
				this.consume(); // Skip non-struct tokens
			}
		}
		return structs;
	}

	validate(ast: StructDeclaration[]): ValidationResult {
		try {
			if (!Array.isArray(ast)) {
				throw new Error("Expected array of struct declarations");
			}
			for (const struct of ast) {
				if (struct.type !== "StructDeclaration") {
					throw new Error("Expected StructDeclaration");
				}
			}
			return { success: true };
		} catch (error) {
			return {
				success: false,
				errors: [
					{
						path: [],
						message: error instanceof Error ? error.message : "Unknown error",
					},
				],
			};
		}
	}

	toJsonSchema(ast: StructDeclaration[]): JsonSchema {
		if (!Array.isArray(ast) || ast.length === 0) {
			throw new Error("Expected at least one struct declaration");
		}

		// Convert the root struct and all its nested types
		return this.convertStructToJsonSchema(ast[0]);
	}

	fromJsonSchema(schema: JsonSchema, name: string): string {
		if (schema.type !== "object") {
			throw new Error("Root schema must be an object");
		}

		return this.convertJsonSchemaToStruct(schema, name, 0);
	}

	private convertJsonSchemaToStruct(
		schema: JsonSchema,
		name: string,
		indentLevel: number,
	): string {
		if (schema.type !== "object") {
			throw new Error("Cannot convert non-object schema to struct");
		}

		const indent = "    ".repeat(indentLevel);
		const propertyIndent = "    ".repeat(indentLevel + 1);
		const lines: string[] = [`${indent}struct ${name} {`];

		// Get all field entries
		const entries = Object.entries(schema.fields);

		// First, collect all nested types and regular properties
		const nestedTypes: string[] = [];
		const properties: string[] = [];

		for (const [fieldName, fieldSchema] of entries) {
			if (
				fieldSchema.type === "object" &&
				Object.keys(fieldSchema.fields).length > 0
			) {
				// Add nested type declaration
				const nestedStruct = this.convertJsonSchemaToStruct(
					fieldSchema,
					this.capitalizeFirstLetter(fieldName),
					indentLevel + 1,
				);
				nestedTypes.push(nestedStruct);
			}

			// Add property declaration
			const propertyType = this.convertJsonSchemaToSwiftType(
				fieldSchema,
				fieldName,
			);
			properties.push(`${propertyIndent}let ${fieldName}: ${propertyType}`);
		}

		// Add nested types first, then properties
		lines.push(...nestedTypes);
		if (nestedTypes.length > 0 && properties.length > 0) {
			lines.push(""); // Add empty line between nested types and properties
		}
		lines.push(...properties);

		lines.push(`${indent}}`);
		return lines.join("\n");
	}

	private convertJsonSchemaToSwiftType(
		schema: JsonSchema,
		fieldName: string,
	): string {
		let type: string;

		switch (schema.type) {
			case "string":
				type = "String";
				break;
			case "number":
				type = schema.int ? "Int" : "Double";
				break;
			case "boolean":
				type = "Bool";
				break;
			case "date":
				type = "Date";
				break;
			case "array":
				type = `[${this.convertJsonSchemaToSwiftType(schema.itemType, fieldName)}]`;
				break;
			case "object":
				// Use capitalized field name for object types
				type = this.capitalizeFirstLetter(fieldName);
				break;
			case "any":
				type = "Any";
				break;
			default:
				type = "Any";
		}

		if (schema.optional) {
			type += "?";
		}

		return type;
	}

	private capitalizeFirstLetter(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	private convertStructToJsonSchema(struct: StructDeclaration): JsonSchema {
		const fields: Record<string, JsonSchema> = {};

		// Convert properties
		for (const prop of struct.properties) {
			fields[prop.name.name] = this.convertTypeToJsonSchema(
				prop.typeAnnotation,
			);
		}

		// Convert nested types as additional fields
		for (const nestedType of struct.nestedTypes) {
			fields[nestedType.name.name] = this.convertStructToJsonSchema(nestedType);
		}

		return {
			type: "object",
			fields,
		};
	}

	private convertTypeToJsonSchema(type: TypeAnnotation): JsonSchema {
		let schema: JsonSchema;

		// Convert base type
		switch (type.name) {
			case "String":
				schema = { type: "string" };
				break;
			case "Int":
				schema = { type: "number", int: true };
				break;
			case "Double":
			case "Float":
				schema = { type: "number" };
				break;
			case "Bool":
				schema = { type: "boolean" };
				break;
			case "Date":
				schema = { type: "date" };
				break;
			default:
				// Handle custom types (likely another struct)
				schema = { type: "object", fields: {} };
		}

		// Handle array type
		if (type.isArray) {
			schema = {
				type: "array",
				itemType: schema,
			};
		}

		// Handle optional type
		if (type.isOptional) {
			schema = {
				...schema,
				optional: true,
			};
		}

		return schema;
	}
}
