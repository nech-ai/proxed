// Add at the top of the file
const SALT_LENGTH = 8;
const KEY_PATTERNS = {
	ANTHROPIC: /^sk-ant-api\d*-/,
	OPENAI: /^sk-.*?-?/,
} as const;

export class KeyValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "KeyValidationError";
	}
}

export interface KeyValidationResult {
	isValid: boolean;
	provider?: keyof typeof KEY_PATTERNS;
	error?: string;
}

export function validateApiKey(key: string): KeyValidationResult {
	if (!key) {
		return { isValid: false, error: "API key is required" };
	}

	// Check for Anthropic pattern
	if (key.startsWith("sk-ant")) {
		if (!KEY_PATTERNS.ANTHROPIC.test(key)) {
			return {
				isValid: false,
				provider: "ANTHROPIC",
				error:
					"Invalid Anthropic API key format. Should start with 'sk-ant-api'",
			};
		}
		return { isValid: true, provider: "ANTHROPIC" };
	}

	// Check for OpenAI pattern
	if (key.startsWith("sk-")) {
		if (!KEY_PATTERNS.OPENAI.test(key)) {
			return {
				isValid: false,
				provider: "OPENAI",
				error: "Invalid OpenAI API key format. Should start with 'sk-'",
			};
		}
		return { isValid: true, provider: "OPENAI" };
	}

	return {
		isValid: false,
		error: "Unrecognized API key format. Key should start with 'sk-'",
	};
}

/**
 * Extracts the API key prefix based on known patterns
 * @param fullKey - The complete API key
 * @returns Object containing the prefix and remaining key portion
 * @throws {Error} If the key format is invalid
 */
export function extractPrefix(fullKey: string): {
	prefix: string;
	leftover: string;
} {
	if (!fullKey || typeof fullKey !== "string") {
		throw new Error("Invalid key format: key must be a non-empty string");
	}

	// Check for known patterns
	const anthropicMatch = fullKey.match(KEY_PATTERNS.ANTHROPIC);
	if (anthropicMatch) {
		return {
			prefix: anthropicMatch[0],
			leftover: fullKey.slice(anthropicMatch[0].length),
		};
	}

	const openAIMatch = fullKey.match(KEY_PATTERNS.OPENAI);
	if (openAIMatch) {
		return {
			prefix: openAIMatch[0],
			leftover: fullKey.slice(openAIMatch[0].length),
		};
	}

	// Default: no prefix
	return { prefix: "", leftover: fullKey };
}

/**
 * Splits an API key into server and client portions with a salt
 * @param fullKey - The complete API key
 * @returns Object containing serverPart and clientPart
 * @throws {Error} If the key is too short or invalid
 */
export function splitKeyWithPrefix(fullKey: string): {
	serverPart: string;
	clientPart: string;
} {
	if (!fullKey || typeof fullKey !== "string") {
		throw new Error("Invalid key format: key must be a non-empty string");
	}

	const { prefix, leftover } = extractPrefix(fullKey);

	if (leftover.length < 2) {
		throw new KeyValidationError("Key leftover too short for splitting");
	}

	// 1. Generate random offset
	const randOffset = Math.floor(Math.random() * (leftover.length - 1)) + 1;

	// 2. Generate random salt (length 8, for example)
	const salt = crypto.randomUUID().slice(0, SALT_LENGTH);
	// or use your own RNG

	// 3. Build server portion
	const serverPart = prefix + leftover.slice(0, randOffset) + salt;

	// 4. Build client portion
	const clientPart = leftover.slice(randOffset) + salt;

	return { serverPart, clientPart };
}

/**
 * Reassembles the original API key from server and client portions
 * @param serverPart - The server portion of the split key
 * @param clientPart - The client portion of the split key
 * @returns The original complete API key
 * @throws {Error} If the salt doesn't match or parts are invalid
 */
export function reassembleKey(serverPart: string, clientPart: string): string {
	if (
		!serverPart ||
		!clientPart ||
		typeof serverPart !== "string" ||
		typeof clientPart !== "string"
	) {
		throw new Error("Invalid key parts: both parts must be non-empty strings");
	}

	// Both contain the salt at the end. The salt length is known (8 in our example).
	const saltFromServer = serverPart.slice(-SALT_LENGTH);
	const saltFromClient = clientPart.slice(-SALT_LENGTH);

	// Check if they match
	if (saltFromServer !== saltFromClient) {
		throw new KeyValidationError(
			"Mismatch: salt does not match. Invalid partial keys.",
		);
	}

	const salt = saltFromServer;

	// Remove salt from both
	const serverCore = serverPart.slice(0, serverPart.length - SALT_LENGTH);
	const clientCore = clientPart.slice(0, clientPart.length - SALT_LENGTH);

	// Full key = serverCore + clientCore
	// Because serverCore includes the prefix + first randomOffset portion
	// and clientCore includes the second portion
	return serverCore + clientCore;
}
