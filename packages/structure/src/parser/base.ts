import type { Position } from "./types";
import {
	tokenize,
	type TokenizerState,
	type Token,
	type TokenType,
} from "./utils/tokenizer";
import { throwParserError } from "./utils/error";
import type { ValidationResult } from "../types";

export interface Node {
	type: string;
	start: number;
	end: number;
}

export interface ParserOptions {
	strict?: boolean;
	[key: string]: unknown;
}

export abstract class BaseParser<T> {
	protected options: ParserOptions;
	protected tokenizer: TokenizerState;

	constructor(options: ParserOptions = {}) {
		this.options = {
			strict: true,
			...options,
		};
		this.tokenizer = {
			tokens: [],
			pos: 0,
			input: "",
		};
	}

	protected peek(): Token | undefined {
		return this.tokenizer.tokens[this.tokenizer.pos];
	}

	protected consume(): Token | undefined {
		const token = this.tokenizer.tokens[this.tokenizer.pos];
		if (token) {
			this.tokenizer.pos++;
		}
		return token;
	}

	protected expect(type: TokenType, value?: string): void {
		const token = this.peek();
		if (
			!token ||
			token.type !== type ||
			(value !== undefined && token.value !== value)
		) {
			this.throwError(
				value !== undefined
					? `Expected ${type} "${value}" but got "${token?.value || "end of input"}"`
					: `Expected ${type} but got "${token?.type || "end of input"}"`,
			);
		}
		this.consume();
	}

	protected skipWhitespace(): void {
		while (
			this.tokenizer.pos < this.tokenizer.tokens.length &&
			this.peek()?.type === "whitespace"
		) {
			this.tokenizer.pos++;
		}
	}

	protected getCurrentPosition(): Position {
		const token = this.peek();
		return {
			line: token?.start || 0,
			column: token?.end || 0,
		};
	}

	protected throwError(message: string): never {
		throwParserError(message, this.getCurrentPosition());
	}

	abstract parse(code: string): T;
	abstract validate(ast: T): ValidationResult;

	protected initializeTokenizer(code: string, regex: RegExp): void {
		this.tokenizer = tokenize(code, regex);
	}

	protected expectToken(type: TokenType, value?: string): void {
		this.skipWhitespace();
		this.expect(type, value);
		this.skipWhitespace();
	}

	protected handleError(error: unknown): never {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("Unknown parser error");
	}
}
