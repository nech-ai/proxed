interface CryptoProvider {
	getRandomValues: (array: Uint8Array) => Uint8Array;
}

interface TokenMetadata {
	version: number;
	timestamp: number;
	splitId: string;
}

function getRandomValues(
	length: number,
	cryptoProvider: CryptoProvider,
): string {
	const array = new Uint8Array(length);
	cryptoProvider.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

const SALT_LENGTH = 16;
const MIN_KEY_LENGTH = 12;
const CURRENT_VERSION = 1;
const METADATA_LENGTH = 32; // 8 chars for version, 16 for timestamp, 8 for splitId

const KEY_PATTERNS = {
	ANTHROPIC: /^sk-ant-api\d{2}-[a-zA-Z0-9-]{24,}(?:\.[a-f0-9]{32})?$/,
	OPENAI:
		/^sk-(?:(?!proj-)[a-zA-Z0-9-]{20,}|proj-[a-zA-Z0-9-_]{20,})(?:\.[a-f0-9]{32})?$/,
} as const;

export class KeyValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "KeyValidationError";
	}
}

export type KeyProvider = keyof typeof KEY_PATTERNS;
export type ValidationErrorCode =
	| "MISSING_KEY"
	| "INVALID_FORMAT"
	| "UNRECOGNIZED_PROVIDER"
	| "KEY_TOO_SHORT"
	| "INVALID_VERSION";

export interface KeyValidationResult {
	isValid: boolean;
	provider?: KeyProvider;
	metadata?: TokenMetadata;
	error?: {
		code: ValidationErrorCode;
		message: string;
	};
}

function encodeMetadata(metadata: TokenMetadata): string {
	const version = metadata.version.toString(16).padStart(8, "0");
	const timestamp = metadata.timestamp.toString(16).padStart(16, "0");
	const splitId = metadata.splitId;
	return `${version}${timestamp}${splitId}`;
}

function decodeMetadata(encoded: string): TokenMetadata | null {
	if (encoded.length !== METADATA_LENGTH) return null;

	try {
		const version = Number.parseInt(encoded.slice(0, 8), 16);
		const timestamp = Number.parseInt(encoded.slice(8, 24), 16);
		const splitId = encoded.slice(24);

		return { version, timestamp, splitId };
	} catch {
		return null;
	}
}

export function validateApiKey(key: string): KeyValidationResult {
	if (!key) {
		return {
			isValid: false,
			error: {
				code: "MISSING_KEY",
				message: "API key is required",
			},
		};
	}

	// Split key and metadata
	const [baseKey, metadataPart] = key.split(".");

	for (const [provider, pattern] of Object.entries(KEY_PATTERNS)) {
		if (pattern.test(key)) {
			if (metadataPart) {
				const metadata = decodeMetadata(metadataPart);
				if (metadata) {
					return { isValid: true, provider: provider as KeyProvider, metadata };
				}
			}
			return { isValid: true, provider: provider as KeyProvider };
		}
	}

	return {
		isValid: false,
		error: {
			code: "UNRECOGNIZED_PROVIDER",
			message: "Unrecognized API key format",
		},
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

	// Remove metadata if present
	const [baseKey] = fullKey.split(".");

	const anthropicMatch = baseKey.match(/^(sk-ant-api\d{2}-)/);
	if (anthropicMatch) {
		return {
			prefix: anthropicMatch[1],
			leftover: baseKey.slice(anthropicMatch[1].length),
		};
	}

	const openAIMatch = baseKey.match(/^(sk-)/);
	if (openAIMatch) {
		return {
			prefix: openAIMatch[1],
			leftover: baseKey.slice(openAIMatch[1].length),
		};
	}

	return { prefix: "", leftover: baseKey };
}

/**
 * Splits an API key into server and client portions with a salt
 * @param fullKey - The complete API key
 * @returns Object containing serverPart and clientPart
 * @throws {Error} If the key is too short or invalid
 */
export function splitKeyWithPrefix(
	fullKey: string,
	cryptoProvider: CryptoProvider,
): {
	serverPart: string;
	clientPart: string;
} {
	const { prefix, leftover } = extractPrefix(fullKey);

	if (leftover.length < MIN_KEY_LENGTH) {
		throw new KeyValidationError(
			"Key must have at least 12 characters after prefix",
		);
	}

	const salt = getRandomValues(SALT_LENGTH / 2, cryptoProvider);
	const randArray = new Uint8Array(1);
	cryptoProvider.getRandomValues(randArray);
	const randOffset = (randArray[0] % (leftover.length - 1)) + 1;

	// Generate metadata
	const splitId = getRandomValues(4, cryptoProvider);
	const metadata: TokenMetadata = {
		version: CURRENT_VERSION,
		timestamp: Date.now(),
		splitId,
	};
	const encodedMetadata = encodeMetadata(metadata);

	const serverPart = `${prefix}${leftover.slice(0, randOffset)}${salt}`;
	const clientPart = `${leftover.slice(randOffset)}${salt}.${encodedMetadata}`;

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

	// Split metadata from client part if present
	const [clientKeyPart, metadataPart] = clientPart.split(".");

	if (serverPart.length < SALT_LENGTH || clientKeyPart.length < SALT_LENGTH) {
		throw new KeyValidationError("Invalid key parts: parts too short");
	}

	const saltFromServer = serverPart.slice(-SALT_LENGTH);
	const saltFromClient = clientKeyPart.slice(-SALT_LENGTH);

	if (saltFromServer !== saltFromClient) {
		throw new KeyValidationError(
			"Mismatch: salt does not match. Invalid partial keys.",
		);
	}

	const serverCore = serverPart.slice(0, -SALT_LENGTH);
	const clientCore = clientKeyPart.slice(0, -SALT_LENGTH);
	const reconstructed = serverCore + clientCore;

	// Add metadata back if present
	const finalKey = metadataPart
		? `${reconstructed}.${metadataPart}`
		: reconstructed;

	const validation = validateApiKey(finalKey);
	if (!validation.isValid) {
		throw new KeyValidationError("Unrecognized API key format");
	}

	return finalKey;
}
