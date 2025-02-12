export function createTokenRegex(patterns: string[]): RegExp {
	const combinedPattern = patterns.join("|");
	return new RegExp(`(${combinedPattern})`, "g");
}

export function isIdentifier(token: string): boolean {
	return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token);
}

export function isStringLiteral(token: string): boolean {
	return /^["'][^"']*["']$/.test(token);
}

export function stripQuotes(token: string): string {
	return token.replace(/^["']|["']$/g, "");
}

export function isNumericLiteral(token: string): boolean {
	return /^-?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(token);
}

export function isWhitespace(token: string): boolean {
	return /^\s+$/.test(token);
}

export function isNewline(token: string): boolean {
	return token === "\n";
}
