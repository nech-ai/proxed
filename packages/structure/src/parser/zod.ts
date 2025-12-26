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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

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

			// Skip TypeScript "as const" assertions if present
			this.skipWhitespace();
			if (this.peek()?.type === "keyword" && this.peek()?.value === "as") {
				// consume 'as'
				this.consume();
				this.skipWhitespace();
				// optionally consume 'const'
				if (this.peek()?.type === "keyword" && this.peek()?.value === "const") {
					this.consume();
				}
				this.skipWhitespace();
			}

			const next = this.peek();
			if (next?.type === "punctuation" && next.value === ",") {
				this.consume();
				this.skipWhitespace();
			}
		}

		this.expectToken("punctuation", ")");

		return {
			type: "CallExpression",
			callee,
			arguments: args,
			start: startPos,
			end: this.getCurrentPosition().column,
		};
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

	validate(ast: unknown): ValidationResult {
		try {
			if (!isRecord(ast) || ast.type !== "ExportNamedDeclaration") {
				throw new Error("Expected ExportNamedDeclaration");
			}
			const declaration = isRecord(ast.declaration) ? ast.declaration : null;
			if (!declaration || declaration.type !== "VariableDeclaration") {
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
		const zodCode = this.jsonSchemaToZodString(schema);
		return `import { z } from "zod";

export const ${name} = ${zodCode};

export type ${name}Type = z.infer<typeof ${name}>;
`;
	}

	private jsonSchemaToZodString(schema: JsonSchema, indentLevel = 0): string {
		const indent = "  ".repeat(indentLevel);
		let zodStr = "z";

		switch (schema.type) {
			case "string": {
				const applyStringConstraints = (base: string) => {
					let value = base;
					if (schema.minLength !== undefined)
						value += `.min(${schema.minLength})`;
					if (schema.maxLength !== undefined)
						value += `.max(${schema.maxLength})`;
					if (schema.length !== undefined) value += `.length(${schema.length})`;
					if (schema.regex) value += `.regex(/${schema.regex}/)`;
					if (schema.startsWith) value += `.startsWith("${schema.startsWith}")`;
					if (schema.endsWith) value += `.endsWith("${schema.endsWith}")`;
					if (schema.trim) value += ".trim()";
					if (schema.toLowerCase) value += ".toLowerCase()";
					if (schema.toUpperCase) value += ".toUpperCase()";
					return value;
				};

				if (schema.ip) {
					const ipv4 = applyStringConstraints("z.ipv4()");
					const ipv6 = applyStringConstraints("z.ipv6()");
					zodStr = `z.union([${ipv4}, ${ipv6}])`;
					break;
				}

				let base = "z.string()";
				if (schema.datetime) {
					base = "z.iso.datetime()";
				} else if (schema.email) {
					base = "z.email()";
				} else if (schema.url) {
					base = "z.url()";
				} else if (schema.uuid) {
					base = "z.uuid()";
				} else if (schema.cuid) {
					base = "z.cuid()";
				} else if (schema.cuid2) {
					base = "z.cuid2()";
				} else if (schema.ulid) {
					base = "z.ulid()";
				} else if (schema.emoji) {
					base = "z.emoji()";
				}

				zodStr = applyStringConstraints(base);
				break;
			}

			case "number": {
				zodStr += ".number()";
				if (schema.int) zodStr += ".int()";
				if (schema.min !== undefined) zodStr += `.min(${schema.min})`;
				if (schema.max !== undefined) zodStr += `.max(${schema.max})`;
				if (schema.finite) zodStr += ".finite()";
				if (schema.safe) zodStr += ".safe()";
				if (schema.positive) zodStr += ".positive()";
				if (schema.negative) zodStr += ".negative()";
				if (schema.nonpositive) zodStr += ".nonpositive()";
				if (schema.nonnegative) zodStr += ".nonnegative()";
				if (schema.multipleOf !== undefined)
					zodStr += `.multipleOf(${schema.multipleOf})`;
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
				if (schema.length !== undefined) zodStr += `.length(${schema.length})`;
				if (schema.nonempty) zodStr += ".nonempty()";
				break;
			}

			case "object": {
				const fields = Object.entries(schema.fields)
					.map(([key, value]) => {
						const fieldSchema = this.jsonSchemaToZodString(
							value,
							indentLevel + 1,
						);
						return `${key}: ${fieldSchema}`;
					})
					.map((line) => `${indent}  ${line}`)
					.join(",\n");
				zodStr += `.object({\n${fields}\n${indent}})`;
				if (schema.strict) zodStr += ".strict()";
				if (schema.strip) zodStr += ".strip()";
				if (schema.catchall)
					zodStr += `.catchall(${this.jsonSchemaToZodString(schema.catchall, indentLevel)})`;
				if (schema.partial) zodStr += ".partial()";
				if (schema.deepPartial) zodStr += ".deepPartial()";
				if (schema.pick)
					zodStr += `.pick([${schema.pick.map((p) => `"${p}"`).join(", ")}])`;
				if (schema.omit)
					zodStr += `.omit([${schema.omit.map((p) => `"${p}"`).join(", ")}])`;
				if (schema.extend)
					zodStr += `.extend(${this.jsonSchemaToZodString(schema.extend, indentLevel)})`;
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

			case "record": {
				zodStr += `.record(${this.jsonSchemaToZodString(schema.keySchema, indentLevel)}, ${this.jsonSchemaToZodString(schema.valueSchema, indentLevel)})`;
				break;
			}

			case "branded": {
				zodStr += `${this.jsonSchemaToZodString(schema.baseSchema, indentLevel)}.brand("${schema.brand}")`;
				break;
			}

			case "promise": {
				zodStr += `.promise(${this.jsonSchemaToZodString(schema.valueSchema, indentLevel)})`;
				break;
			}

			case "lazy": {
				zodStr += `.lazy(() => ${schema.getter})`;
				break;
			}

			default:
				throw new Error(
					`Unsupported schema type: ${(schema as JsonSchema).type}`,
				);
		}

		if (schema.optional || schema.nullable) zodStr += ".nullable()";
		if (schema.description) zodStr += `.describe("${schema.description}")`;
		if (schema.defaultValue !== undefined) {
			const defaultVal =
				typeof schema.defaultValue === "string"
					? `"${schema.defaultValue}"`
					: schema.defaultValue;
			zodStr += `.default(${defaultVal})`;
		}

		// Apply refinements
		if (schema.refinements) {
			for (const refinement of schema.refinements) {
				zodStr += `.refine(${refinement.validation}`;
				if (refinement.message || refinement.code) {
					zodStr += `, { message: "${refinement.message || ""}", code: "${refinement.code || ""}" }`;
				}
				zodStr += ")";
			}
		}

		// Apply transformations
		if (schema.transformations) {
			for (const transformation of schema.transformations) {
				zodStr += `.transform(${transformation.transform})`;
			}
		}

		// Apply preprocessing
		if (schema.preprocess) {
			zodStr += `.preprocess((val) => {
				if (typeof val !== "${schema.preprocess.type}") {
					return ${schema.preprocess.coerce ? `${schema.preprocess.type}(val)` : "val"};
				}
				return val;
			})`;
		}

		return zodStr;
	}

	private convertExpressionToJsonSchema(expr: Expression): JsonSchema {
		if (expr.type === "CallExpression") {
			const callee = expr.callee;

			// Handle method chaining
			if (callee.type === "MemberExpression") {
				const object = callee.object;
				const method = callee.property.name;

				// Handle root level z.object() call
				if (object.type === "Identifier" && object.name === "z") {
					const schema = this.handleZodMethod(method, expr.arguments, object);
					if (schema) {
						return schema;
					}
				}

				// Handle method chaining on objects
				const baseSchema = this.convertExpressionToJsonSchema(object);
				const arg = expr.arguments[0];

				const isLiteral = (expr: Expression | undefined): expr is Literal => {
					return expr?.type === "Literal";
				};

				// Handle required method
				if (method === "required") {
					const stripOptionalAndNullable = <T extends JsonSchema>(
						schema: T,
					): T => {
						return {
							...schema,
							optional: undefined,
							nullable: undefined,
						};
					};

					if (baseSchema.type === "object") {
						// Make all fields required
						const fields: Record<string, JsonSchema> = {};
						for (const [key, field] of Object.entries(baseSchema.fields)) {
							fields[key] = stripOptionalAndNullable(field);
						}
						return { ...stripOptionalAndNullable(baseSchema), fields };
					}

					return stripOptionalAndNullable(baseSchema);
				}

				// Handle describe method
				if (method === "describe" && isLiteral(arg)) {
					return { ...baseSchema, description: String(arg.value) };
				}

				// Handle number modifiers
				if (baseSchema.type === "number") {
					if (method === "int") {
						return { ...baseSchema, int: true };
					}
					if (method === "min" && isLiteral(arg)) {
						return { ...baseSchema, min: Number(arg.value) };
					}
					if (method === "max" && isLiteral(arg)) {
						return { ...baseSchema, max: Number(arg.value) };
					}
				}

				// Handle string modifiers
				if (baseSchema.type === "string") {
					if (method === "email") {
						return { ...baseSchema, email: true };
					}
					if (method === "url") {
						return { ...baseSchema, url: true };
					}
					if (method === "uuid") {
						return { ...baseSchema, uuid: true };
					}
					if (method === "min" && isLiteral(arg)) {
						return { ...baseSchema, minLength: Number(arg.value) };
					}
					if (method === "max" && isLiteral(arg)) {
						return { ...baseSchema, maxLength: Number(arg.value) };
					}
				}

				// Handle optional and nullish modifiers -> convert to nullable to satisfy OpenAI structured outputs
				if (method === "optional" || method === "nullish") {
					return { ...baseSchema, nullable: true };
				}

				// Handle explicit nullable modifier
				if (method === "nullable") {
					return { ...baseSchema, nullable: true };
				}

				return baseSchema;
			}

			// Handle direct function calls
			if (callee.type === "Identifier") {
				const schema = this.handleZodMethod(
					callee.name,
					expr.arguments,
					callee,
				);
				if (schema) {
					return schema;
				}
			}

			return this.convertExpressionToJsonSchema(callee);
		}

		if (expr.type === "MemberExpression") {
			const object = expr.object;
			const method = expr.property.name;

			// Handle z.string(), z.number(), etc.
			if (object.type === "Identifier" && object.name === "z") {
				const schema = this.handleZodMethod(method, [], object);
				if (schema) {
					return schema;
				}
			}

			// Handle nested member expressions
			const baseSchema = this.convertExpressionToJsonSchema(object);
			const schema = this.handleZodMethod(method, [], object);
			if (schema) {
				return schema;
			}
			return baseSchema;
		}

		if (expr.type === "Identifier" && expr.name === "z") {
			return { type: "any" };
		}

		if (expr.type === "ObjectExpression") {
			const fields: Record<string, JsonSchema> = {};
			for (const prop of expr.properties) {
				fields[prop.key.name] = this.convertExpressionToJsonSchema(prop.value);
			}
			return { type: "object", fields };
		}

		if (expr.type === "ArrayExpression") {
			if (expr.elements.length === 0) {
				return { type: "array", itemType: { type: "any" } };
			}
			const itemType = this.convertExpressionToJsonSchema(expr.elements[0]);
			return { type: "array", itemType };
		}

		if (expr.type === "Literal") {
			if (typeof expr.value === "string") {
				return { type: "string" };
			}
			if (typeof expr.value === "number") {
				return { type: "number" };
			}
			if (typeof expr.value === "boolean") {
				return { type: "boolean" };
			}
		}

		throw new Error(`Invalid schema expression of type: ${expr.type}`);
	}

	private handleZodMethod(
		method: string,
		args: Expression[],
		_object: Expression,
	): JsonSchema | undefined {
		switch (method) {
			case "object": {
				const objArg = args[0] as ObjectExpression;
				if (!objArg || objArg.type !== "ObjectExpression") {
					return { type: "object", fields: {} };
				}
				const fields: Record<string, JsonSchema> = {};
				for (const prop of objArg.properties) {
					const value = this.convertExpressionToJsonSchema(prop.value);
					fields[prop.key.name] = value;
				}
				return { type: "object", fields };
			}

			case "string":
				return { type: "string" };

			case "number":
				return { type: "number" };

			case "boolean":
				return { type: "boolean" };

			case "date":
				return { type: "date" };

			case "array": {
				const itemType = args[0]
					? this.convertExpressionToJsonSchema(args[0])
					: { type: "any" as const };
				return { type: "array", itemType };
			}

			case "enum": {
				const enumArg = args[0] as ArrayExpression;
				if (!enumArg || enumArg.type !== "ArrayExpression") {
					throw new Error("Expected array of enum values");
				}
				const values = enumArg.elements.map((el) => {
					if (el.type !== "Literal") {
						throw new Error("Enum values must be literals");
					}
					return String(el.value);
				});
				return { type: "enum", values };
			}

			case "union": {
				const variants = args.map((arg) =>
					this.convertExpressionToJsonSchema(arg),
				);
				return { type: "union", variants };
			}

			case "intersection": {
				const allOf = args.map((arg) =>
					this.convertExpressionToJsonSchema(arg),
				);
				return { type: "intersection", allOf };
			}

			case "literal": {
				const arg = args[0];
				if (!arg || arg.type !== "Literal") {
					throw new Error("Expected literal value");
				}
				return { type: "literal", value: arg.value };
			}

			case "any":
				return { type: "any" };

			case "unknown":
				return { type: "unknown" };

			default:
				return undefined;
		}
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
				type StringSchema = z.ZodString | z.ZodStringFormat;
				const applyStringConstraints = (
					validator: StringSchema,
				): StringSchema => {
					let result: StringSchema = validator;
					if (schema.minLength !== undefined)
						result = result.min(schema.minLength);
					if (schema.maxLength !== undefined)
						result = result.max(schema.maxLength);
					if (schema.length !== undefined)
						result = result.length(schema.length);
					if (schema.regex) result = result.regex(new RegExp(schema.regex));
					if (schema.startsWith) result = result.startsWith(schema.startsWith);
					if (schema.endsWith) result = result.endsWith(schema.endsWith);
					if (schema.trim) result = result.trim();
					if (schema.toLowerCase) result = result.toLowerCase();
					if (schema.toUpperCase) result = result.toUpperCase();
					return result;
				};

				if (schema.ip) {
					const ipv4 = applyStringConstraints(z.ipv4());
					const ipv6 = applyStringConstraints(z.ipv6());
					return this.applyCommonValidators(z.union([ipv4, ipv6]), schema);
				}

				let validator: StringSchema = z.string();
				if (schema.datetime) {
					validator = z.iso.datetime();
				} else if (schema.email) {
					validator = z.email();
				} else if (schema.url) {
					validator = z.url();
				} else if (schema.uuid) {
					validator = z.uuid();
				} else if (schema.cuid) {
					validator = z.cuid();
				} else if (schema.cuid2) {
					validator = z.cuid2();
				} else if (schema.ulid) {
					validator = z.ulid();
				} else if (schema.emoji) {
					validator = z.emoji();
				}

				validator = applyStringConstraints(validator);
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
				// OpenAI structured outputs demand additionalProperties: false
				// Map this to Zod's .strict() so unexpected keys are disallowed
				return this.applyCommonValidators(z.object(shape).strict(), schema);
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
		if (schema.optional) result = result.nullable();
		if (schema.nullable) result = result.nullable();
		if (schema.description) result = result.describe(schema.description);
		if (schema.defaultValue !== undefined)
			result = result.default(schema.defaultValue);
		return result;
	}
}
