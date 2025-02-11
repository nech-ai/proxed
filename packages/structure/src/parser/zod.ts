import { BaseParser, type ParserOptions } from "./base";
import { createTokenRegex } from "./utils";
import type { Identifier } from "./types/base";
import type {
	CallExpression,
	MemberExpression,
	ObjectExpression,
	ArrayExpression,
	Property,
	Literal,
	VariableDeclaration,
	VariableDeclarator,
	ExportNamedDeclaration,
	Expression,
} from "./types/zod";
import type { ValidationResult, JsonSchema, SchemaResult } from "../types";
import { z } from "zod";

const ZOD_TOKEN_PATTERNS = [
	// Keywords
	"\\b(?:import|export|from|as|const|let|var)\\b",
	// Identifiers
	"\\b[a-zA-Z_$][a-zA-Z0-9_$]*\\b",
	// Punctuation
	"[(){},;\\[\\]\\.]",
	// Operators
	"=>|=|\\:|\\?",
	// String literals with escaped quotes
	'"(?:[^"\\\\]|\\\\.)*"',
	"'(?:[^'\\\\]|\\\\.)*'",
	// Numbers
	"\\b\\d+(?:\\.\\d+)?\\b",
	// Whitespace
	"\\s+",
];

export class ZodParser extends BaseParser<ExportNamedDeclaration> {
	private static readonly TOKEN_REGEX = createTokenRegex(ZOD_TOKEN_PATTERNS);

	constructor(options: ParserOptions = {}) {
		super(options);
	}

	private parseIdentifier(): Identifier {
		const token = this.consume();
		if (!token || token.type !== "identifier") {
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

	private parseMemberExpression(
		object: Identifier | MemberExpression,
	): MemberExpression {
		const startPos = object.start;
		this.skipWhitespace();
		this.expectToken("punctuation", ".");
		const property = this.parseIdentifier();
		const expr: MemberExpression = {
			type: "MemberExpression",
			object,
			property,
			start: startPos,
			end: property.end,
		};

		const next = this.peek();
		if (next?.type === "punctuation" && next.value === ".") {
			return this.parseMemberExpression(expr);
		}

		return expr;
	}

	private parseCallExpression(
		callee: Identifier | MemberExpression,
	): CallExpression {
		const startPos = this.getCurrentPosition().column;
		this.skipWhitespace();
		this.expectToken("punctuation", "(");
		const args: Expression[] = [];

		while (this.peek() && this.peek()?.value !== ")") {
			args.push(this.parseExpression());
			const next = this.peek();
			if (next?.type === "punctuation" && next.value === ",") {
				this.consume();
				this.skipWhitespace();
			}
		}

		this.expectToken("punctuation", ")");

		const expr: CallExpression = {
			type: "CallExpression",
			callee,
			arguments: args,
			start: startPos,
			end: this.getCurrentPosition().column,
		};

		// Handle chained calls like .min(3).max(10)
		const next = this.peek();
		if (next?.type === "punctuation" && next.value === ".") {
			const memberExpr = this.parseMemberExpression({
				type: "Identifier",
				name: "result",
				start: expr.start,
				end: expr.end,
			});
			return this.parseCallExpression(memberExpr);
		}

		return expr;
	}

	private parseObjectExpression(): ObjectExpression {
		const startPos = this.getCurrentPosition().column;
		this.skipWhitespace();
		this.expectToken("punctuation", "{");
		const properties: Property[] = [];

		while (this.peek() && this.peek()?.value !== "}") {
			const key = this.parseIdentifier();
			this.skipWhitespace();
			this.expectToken("operator", ":");
			this.skipWhitespace();
			const value = this.parseExpression();
			properties.push({
				type: "Property",
				key,
				value,
				start: key.start,
				end: value.end,
			});

			const next = this.peek();
			if (next?.type === "punctuation" && next.value === ",") {
				this.consume();
				this.skipWhitespace();
			}
		}

		this.expectToken("punctuation", "}");

		return {
			type: "ObjectExpression",
			properties,
			start: startPos,
			end: this.getCurrentPosition().column,
		};
	}

	private parseArrayExpression(): ArrayExpression {
		const startPos = this.getCurrentPosition().column;
		this.skipWhitespace();
		this.expectToken("punctuation", "[");
		const elements: Expression[] = [];

		while (this.peek() && this.peek()?.value !== "]") {
			elements.push(this.parseExpression());
			const next = this.peek();
			if (next?.type === "punctuation" && next.value === ",") {
				this.consume();
				this.skipWhitespace();
			}
		}

		this.expectToken("punctuation", "]");

		return {
			type: "ArrayExpression",
			elements,
			start: startPos,
			end: this.getCurrentPosition().column,
		};
	}

	private parseLiteral(): Literal {
		const token = this.consume();
		if (!token || (token.type !== "string" && token.type !== "number")) {
			this.throwError(
				`Expected literal but got ${token?.type || "end of input"}`,
			);
		}
		return {
			type: "Literal",
			value: token.type === "string" ? token.value : JSON.parse(token.value),
			start: token.start,
			end: token.end,
		};
	}

	private parseExpression(): Expression {
		this.skipWhitespace();
		const token = this.peek();
		if (!token) {
			this.throwError("Unexpected end of input");
		}

		let expr: Expression | Identifier | MemberExpression;

		if (token.type === "punctuation") {
			switch (token.value) {
				case "{":
					expr = this.parseObjectExpression();
					break;
				case "[":
					expr = this.parseArrayExpression();
					break;
				default:
					this.throwError(`Unexpected token: ${token.value}`);
			}
		} else if (token.type === "string" || token.type === "number") {
			expr = this.parseLiteral();
		} else {
			expr = this.parseIdentifier();

			// Handle z.string(), z.object(), etc.
			if (expr.type === "Identifier" && expr.name === "z") {
				const next = this.peek();
				if (next?.type === "punctuation" && next.value === ".") {
					expr = this.parseMemberExpression(expr);
				}
			}

			// Handle method chains and calls
			while (this.peek()) {
				const next = this.peek();
				if (next?.type === "punctuation") {
					if (next.value === ".") {
						expr = this.parseMemberExpression(
							expr as Identifier | MemberExpression,
						);
					} else if (next.value === "(") {
						expr = this.parseCallExpression(
							expr as Identifier | MemberExpression,
						);
					} else {
						break;
					}
				} else {
					break;
				}
				this.skipWhitespace();
			}
		}

		return expr as Expression;
	}

	parse(code: string): ExportNamedDeclaration {
		this.initializeTokenizer(code, ZodParser.TOKEN_REGEX);

		// Handle import statement if present
		const nextToken = this.peek();
		if (nextToken?.type === "keyword" && nextToken.value === "import") {
			while (
				this.peek() &&
				!this.peek()?.value.includes(";") &&
				!this.peek()?.value.includes("\n")
			) {
				this.consume();
			}
			if (this.peek()?.type === "punctuation" && this.peek()?.value === ";") {
				this.consume();
			}
			this.skipWhitespace();
		}

		this.expectToken("keyword", "export");
		this.skipWhitespace();
		this.expectToken("keyword", "const");
		this.skipWhitespace();

		const startPos = this.getCurrentPosition().column;
		const declaration: VariableDeclaration = {
			type: "VariableDeclaration",
			declarations: [this.parseVariableDeclarator()],
			start: startPos,
			end: this.getCurrentPosition().column,
		};

		return {
			type: "ExportNamedDeclaration",
			declaration,
			start: startPos,
			end: declaration.end,
		};
	}

	private parseVariableDeclarator(): VariableDeclarator {
		const startPos = this.getCurrentPosition().column;
		const id = this.parseIdentifier();
		this.skipWhitespace();
		this.expectToken("operator", "=");
		this.skipWhitespace();
		const init = this.parseExpression();

		return {
			type: "VariableDeclarator",
			id,
			init,
			start: startPos,
			end: init.end,
		};
	}

	validate(ast: ExportNamedDeclaration): ValidationResult {
		try {
			if (ast.type !== "ExportNamedDeclaration") {
				throw new Error("Expected ExportNamedDeclaration");
			}
			if (!ast.declaration || ast.declaration.type !== "VariableDeclaration") {
				throw new Error("Expected VariableDeclaration");
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

	toJsonSchema(ast: ExportNamedDeclaration): JsonSchema {
		if (
			ast.type !== "ExportNamedDeclaration" ||
			!ast.declaration ||
			ast.declaration.type !== "VariableDeclaration"
		) {
			throw new Error("Invalid AST structure");
		}

		const init = ast.declaration.declarations[0]?.init;
		if (!init) {
			throw new Error("No schema initialization found");
		}

		return this.convertExpressionToJsonSchema(init);
	}

	fromJsonSchema(schema: JsonSchema, name: string): string {
		const zodCode = this.convertJsonSchemaToZod(schema);
		return `import { z } from "zod";\n\nexport const ${name} = ${zodCode};\n\nexport type ${name}Type = z.infer<typeof ${name}>;\n`;
	}

	convertJsonSchemaToZod(schema: JsonSchema): SchemaResult<string> {
		try {
			const zodCode = this.jsonSchemaToZodString(schema);
			return {
				success: true,
				data: zodCode,
			};
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

	private jsonSchemaToZodString(schema: JsonSchema, indentLevel = 0): string {
		const indent = "  ".repeat(indentLevel);
		let zodStr = "z";

		switch (schema.type) {
			case "string": {
				zodStr += ".string()";
				if (schema.minLength !== undefined)
					zodStr += `.min(${schema.minLength})`;
				if (schema.maxLength !== undefined)
					zodStr += `.max(${schema.maxLength})`;
				if (schema.regex) zodStr += `.regex(/${schema.regex}/)`;
				if (schema.email) zodStr += ".email()";
				if (schema.url) zodStr += ".url()";
				if (schema.uuid) zodStr += ".uuid()";
				break;
			}

			case "number": {
				zodStr += schema.int ? ".number().int()" : ".number()";
				if (schema.min !== undefined) zodStr += `.min(${schema.min})`;
				if (schema.max !== undefined) zodStr += `.max(${schema.max})`;
				break;
			}

			case "boolean": {
				zodStr += ".boolean()";
				break;
			}

			case "array": {
				zodStr += `.array(${this.jsonSchemaToZodString(schema.itemType, indentLevel)})`;
				if (schema.minItems !== undefined) zodStr += `.min(${schema.minItems})`;
				if (schema.maxItems !== undefined) zodStr += `.max(${schema.maxItems})`;
				break;
			}

			case "object": {
				const fields = Object.entries(schema.fields)
					.map(([key, value]) => {
						const fieldSchema = this.jsonSchemaToZodString(
							value,
							indentLevel + 1,
						);
						return `${indent}  ${key}: ${fieldSchema}`;
					})
					.join(",\n");
				zodStr += `.object({\n${fields}\n${indent}})`;
				break;
			}

			case "union": {
				const variants = schema.variants
					.map((v) => this.jsonSchemaToZodString(v, indentLevel))
					.join(", ");
				zodStr += `.union([${variants}])`;
				break;
			}

			case "intersection": {
				const types = schema.allOf
					.map((t) => this.jsonSchemaToZodString(t, indentLevel))
					.join(", ");
				zodStr += `.intersection([${types}])`;
				break;
			}

			case "enum": {
				const values = schema.values.map((v) => `"${v}"`).join(", ");
				zodStr += `.enum([${values}])`;
				break;
			}

			case "literal": {
				zodStr += `.literal(${typeof schema.value === "string" ? `"${schema.value}"` : schema.value})`;
				break;
			}

			case "date": {
				zodStr += ".date()";
				break;
			}

			case "any": {
				zodStr += ".any()";
				break;
			}

			case "unknown": {
				zodStr += ".unknown()";
				break;
			}

			default:
				throw new Error(
					`Unsupported schema type: ${(schema as JsonSchema).type}`,
				);
		}

		if (schema.optional) zodStr += ".optional()";
		if (schema.nullable) zodStr += ".nullable()";
		if (schema.description) zodStr += `.describe("${schema.description}")`;
		if (schema.defaultValue !== undefined) {
			const defaultVal =
				typeof schema.defaultValue === "string"
					? `"${schema.defaultValue}"`
					: schema.defaultValue;
			zodStr += `.default(${defaultVal})`;
		}

		return zodStr;
	}

	private convertExpressionToJsonSchema(expr: Expression): JsonSchema {
		if (expr.type === "CallExpression") {
			const callee = expr.callee as MemberExpression;
			if (callee.type !== "MemberExpression") {
				throw new Error("Invalid schema expression");
			}

			// Handle method chaining
			const object = callee.object;
			if (
				object.type === "MemberExpression" ||
				object.type === "CallExpression"
			) {
				const baseSchema = this.convertExpressionToJsonSchema(object);
				const method = callee.property.name;
				const arg = expr.arguments[0];

				const isLiteral = (expr: Expression | undefined): expr is Literal => {
					return expr?.type === "Literal";
				};

				// Handle describe method
				if (method === "describe" && isLiteral(arg)) {
					return { ...baseSchema, description: String(arg.value) };
				}

				const applyNumericModifier = (
					schema: JsonSchema,
					prop: string,
					value: unknown,
				): JsonSchema => {
					if (isLiteral(arg) && typeof arg.value === "number") {
						return { ...schema, [prop]: arg.value };
					}
					return schema;
				};

				const applyBooleanModifier = (
					schema: JsonSchema,
					prop: string,
				): JsonSchema => {
					return { ...schema, [prop]: true };
				};

				// Apply method modifiers to the base schema
				if (baseSchema.type === "number") {
					switch (method) {
						case "int":
							return applyBooleanModifier(baseSchema, "int");
						case "min":
						case "max":
							return applyNumericModifier(
								baseSchema,
								method,
								isLiteral(arg) ? arg.value : undefined,
							);
					}
				}

				if (baseSchema.type === "string") {
					switch (method) {
						case "email":
						case "url":
						case "uuid":
							return applyBooleanModifier(baseSchema, method);
						case "min":
						case "max":
							return applyNumericModifier(
								baseSchema,
								`${method}Length`,
								isLiteral(arg) ? arg.value : undefined,
							);
						case "regex":
							if (isLiteral(arg) && typeof arg.value === "string") {
								return { ...baseSchema, regex: arg.value };
							}
					}
				}

				if (baseSchema.type === "array") {
					switch (method) {
						case "min":
						case "max":
							return applyNumericModifier(
								baseSchema,
								`${method}Items`,
								isLiteral(arg) ? arg.value : undefined,
							);
					}
				}

				return baseSchema;
			}

			const method = callee.property.name;
			let schema: JsonSchema;

			switch (method) {
				case "object": {
					const objArg = expr.arguments[0] as ObjectExpression;
					if (!objArg || objArg.type !== "ObjectExpression") {
						schema = { type: "object", fields: {} };
					} else {
						const fields: Record<string, JsonSchema> = {};
						for (const prop of objArg.properties) {
							fields[prop.key.name] = this.convertExpressionToJsonSchema(
								prop.value,
							);
						}
						schema = { type: "object", fields };
					}
					break;
				}

				case "string":
					schema = { type: "string" };
					break;
				case "number":
					schema = { type: "number" };
					break;
				case "boolean":
					schema = { type: "boolean" };
					break;
				case "date":
					schema = { type: "date" };
					break;
				case "int":
					schema = { type: "number", int: true };
					break;

				case "array": {
					const itemType = expr.arguments[0]
						? this.convertExpressionToJsonSchema(expr.arguments[0])
						: { type: "any" as const };
					schema = { type: "array", itemType };
					break;
				}

				case "enum": {
					const enumArg = expr.arguments[0] as ArrayExpression;
					if (!enumArg || enumArg.type !== "ArrayExpression") {
						throw new Error("Expected array of enum values");
					}
					const values = enumArg.elements.map((el) => {
						if (el.type !== "Literal") {
							throw new Error("Enum values must be literals");
						}
						return String(el.value);
					});
					schema = { type: "enum", values };
					break;
				}

				case "describe": {
					const arg = expr.arguments[0];
					if (arg?.type !== "Literal") {
						throw new Error("Expected string literal in describe()");
					}
					schema = { type: "any", description: String(arg.value) };
					break;
				}

				default:
					throw new Error(`Unsupported schema type: ${method}`);
			}

			return schema;
		}

		throw new Error("Invalid schema expression");
	}

	createValidator(jsonSchema: JsonSchema): string {
		const zodCode = this.fromJsonSchema(jsonSchema, "schema");
		return `
import { z } from "zod";

${zodCode}

export type SchemaType = z.infer<typeof schema>;
export const validate = (data: unknown) => schema.safeParse(data);
export const validateOrThrow = (data: unknown) => schema.parse(data);
export default schema;
`;
	}

	convertJsonSchemaToZodValidator(schema: JsonSchema): z.ZodType {
		switch (schema.type) {
			case "string": {
				let validator = z.string();
				if (schema.minLength !== undefined)
					validator = validator.min(schema.minLength);
				if (schema.maxLength !== undefined)
					validator = validator.max(schema.maxLength);
				if (schema.regex) validator = validator.regex(new RegExp(schema.regex));
				if (schema.email) validator = validator.email();
				if (schema.url) validator = validator.url();
				if (schema.uuid) validator = validator.uuid();
				return this.applyCommonValidators(validator, schema);
			}

			case "number": {
				let validator = z.number();
				if (schema.int) validator = validator.int();
				if (schema.min !== undefined) validator = validator.min(schema.min);
				if (schema.max !== undefined) validator = validator.max(schema.max);
				return this.applyCommonValidators(validator, schema);
			}

			case "boolean": {
				return this.applyCommonValidators(z.boolean(), schema);
			}

			case "array": {
				const validator = z.array(
					this.convertJsonSchemaToZodValidator(schema.itemType),
				);
				if (schema.minItems !== undefined) validator.min(schema.minItems);
				if (schema.maxItems !== undefined) validator.max(schema.maxItems);
				return this.applyCommonValidators(validator, schema);
			}

			case "object": {
				const shape: Record<string, z.ZodType> = {};
				for (const [key, value] of Object.entries(schema.fields)) {
					shape[key] = this.convertJsonSchemaToZodValidator(value);
				}
				return this.applyCommonValidators(z.object(shape), schema);
			}

			case "union": {
				if (schema.variants.length < 2) {
					throw new Error("Union must have at least 2 variants");
				}
				const validators = schema.variants.map((v) =>
					this.convertJsonSchemaToZodValidator(v),
				);
				return this.applyCommonValidators(
					z.union([validators[0], validators[1], ...validators.slice(2)]),
					schema,
				);
			}

			case "intersection": {
				if (schema.allOf.length < 2) {
					throw new Error("Intersection must have at least 2 types");
				}
				const validators = schema.allOf.map((v) =>
					this.convertJsonSchemaToZodValidator(v),
				);
				return this.applyCommonValidators(
					validators.reduce((acc, curr) => acc.and(curr)),
					schema,
				);
			}

			case "enum": {
				if (schema.values.length === 0) {
					throw new Error("Enum must have at least one value");
				}
				return this.applyCommonValidators(
					z.enum([schema.values[0], ...schema.values.slice(1)] as [
						string,
						...string[],
					]),
					schema,
				);
			}

			case "literal": {
				return this.applyCommonValidators(z.literal(schema.value), schema);
			}

			case "date": {
				return this.applyCommonValidators(z.date(), schema);
			}

			case "any": {
				return this.applyCommonValidators(z.any(), schema);
			}

			case "unknown": {
				return this.applyCommonValidators(z.unknown(), schema);
			}

			default:
				throw new Error(
					`Unsupported schema type: ${(schema as JsonSchema).type}`,
				);
		}
	}

	private applyCommonValidators<T extends z.ZodType>(
		validator: T,
		schema: JsonSchema,
	): z.ZodType {
		let result: z.ZodType = validator;
		if (schema.optional) result = result.optional();
		if (schema.nullable) result = result.nullable();
		if (schema.description) result = result.describe(schema.description);
		if (schema.defaultValue !== undefined)
			result = result.default(schema.defaultValue);
		return result;
	}
}
