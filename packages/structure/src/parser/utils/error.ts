import type { Position } from "../types/base";

export class ParserError extends Error {
	constructor(
		message: string,
		public position: Position,
	) {
		super(`${message} at line ${position.line}, column ${position.column}`);
		this.name = "ParserError";
	}
}

export function createParserError(
	message: string,
	position: Position,
): ParserError {
	return new ParserError(message, position);
}

export function throwParserError(message: string, position: Position): never {
	throw createParserError(message, position);
}
