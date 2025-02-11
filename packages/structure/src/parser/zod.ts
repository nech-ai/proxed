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
import type { ValidationResult, JsonSchema } from "../types";

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

	convertJsonSchemaToZod(schema: JsonSchema): string {
		let code = "";
		switch (schema.type) {
			case "string": {
				code = "z.string()";
				if ("minLength" in schema && schema.minLength !== undefined)
					code += `.min(${schema.minLength})`;
				if ("maxLength" in schema && schema.maxLength !== undefined)
					code += `.max(${schema.maxLength})`;
				if ("email" in schema && schema.email) code += ".email()";
				if ("url" in schema && schema.url) code += ".url()";
				if ("uuid" in schema && schema.uuid) code += ".uuid()";
				if ("regex" in schema && schema.regex)
					code += `.regex(new RegExp("${schema.regex}"))`;
				break;
			}
			case "number": {
				code = "z.number()";
				if ("min" in schema && schema.min !== undefined)
					code += `.min(${schema.min})`;
				if ("max" in schema && schema.max !== undefined)
					code += `.max(${schema.max})`;
				if ("int" in schema && schema.int) code += ".int()";
				break;
			}
			case "boolean":
				code = "z.boolean()";
				break;
			case "date":
				code = "z.date()";
				break;
			case "array":
				code = `z.array(${this.convertJsonSchemaToZod(schema.itemType)})`;
				break;
			case "object": {
				const fields = Object.entries(schema.fields)
					.map(
						([key, value]) => `  ${key}: ${this.convertJsonSchemaToZod(value)}`,
					)
					.join(",\n");
				code = `z.object({\n${fields}\n})`;
				break;
			}
			case "union":
				code = `z.union([${schema.variants.map((v) => this.convertJsonSchemaToZod(v)).join(", ")}])`;
				break;
			case "intersection":
				code = schema.allOf
					.map((s) => this.convertJsonSchemaToZod(s))
					.join(".and(");
				break;
			case "enum":
				code = `z.enum([${schema.values.map((v) => `"${v}"`).join(", ")}])`;
				break;
			case "literal":
				code = `z.literal(${typeof schema.value === "string" ? `"${schema.value}"` : schema.value})`;
				break;
			case "any":
				code = "z.any()";
				break;
			case "unknown":
				code = "z.unknown()";
				break;
			default:
				throw new Error(
					`Unsupported schema type: ${(schema as { type: string }).type}`,
				);
		}

		if (schema.optional) {
			code += ".optional()";
		}
		if (schema.nullable) {
			code += ".nullable()";
		}
		if (schema.description) {
			// If the description contains double quotes, use single quotes to wrap it
			const hasDoubleQuotes = schema.description.includes('"');
			const quote = hasDoubleQuotes ? "'" : '"';
			code += `.describe(${quote}${schema.description}${quote})`;
		}
		if (schema.defaultValue !== undefined) {
			code += `.default(${JSON.stringify(schema.defaultValue)})`;
		}

		return code;
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
}
