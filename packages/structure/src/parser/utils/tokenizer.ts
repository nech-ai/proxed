export type TokenType =
	| "whitespace"
	| "identifier"
	| "number"
	| "string"
	| "punctuation"
	| "operator"
	| "keyword";

export interface Token {
	type: TokenType;
	value: string;
	start: number;
	end: number;
}

export interface TokenizerState {
	tokens: Token[];
	pos: number;
	input: string;
}

export function tokenize(
	input: string | undefined | null,
	regex: RegExp,
): TokenizerState {
	if (!input) {
		return { tokens: [], pos: 0, input: "" };
	}

	const tokens: Token[] = [];
	let pos = 0;
	let line = 1;
	let column = 1;

	while (pos < input.length) {
		regex.lastIndex = pos;
		const match = regex.exec(input);

		if (!match || match.index !== pos) {
			throw new Error(
				`Unexpected character at position ${pos} (line ${line}, column ${column})`,
			);
		}

		const [value] = match;
		const start = pos;
		const end = pos + value.length;

		// Update line and column numbers
		if (value.includes("\n")) {
			const lines = value.split("\n");
			line += lines.length - 1;
			column = lines[lines.length - 1].length + 1;
		} else {
			column += value.length;
		}

		// Skip pure whitespace tokens
		if (!/^\s+$/.test(value)) {
			const trimmed = value.trim();
			const type = determineTokenType(trimmed);
			tokens.push({
				type,
				value: type === "string" ? trimmed.slice(1, -1) : trimmed,
				start,
				end,
			});
		}

		pos = end;
	}

	return { tokens, pos: 0, input };
}

const KEYWORDS = new Set([
	"import",
	"export",
	"from",
	"as",
	"default",
	"const",
	"let",
	"var",
	"function",
	"class",
	"interface",
	"type",
	"enum",
	"namespace",
]);

function determineTokenType(value: string): TokenType {
	const trimmed = value.trim();
	if (!trimmed) return "whitespace";
	if (KEYWORDS.has(trimmed)) return "keyword";
	if (/^[a-zA-Z_]\w*$/.test(trimmed)) return "identifier";
	if (/^[0-9]+(?:\.[0-9]+)?$/.test(trimmed)) return "number";
	if (/^["'].*["']$/.test(trimmed)) return "string";
	if (/^[=<>!+\-*/%&|^~?:]+$/.test(trimmed)) return "operator";
	return "punctuation";
}

export function createTokenRegex(patterns: string[]): RegExp {
	const combinedPattern = patterns.join("|");
	return new RegExp(`(${combinedPattern})`, "g");
}
