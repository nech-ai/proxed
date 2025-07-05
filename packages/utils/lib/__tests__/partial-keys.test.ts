import { describe, test, expect } from "bun:test";
import {
	validateApiKey,
	splitKeyWithPrefix,
	reassembleKey,
	KeyValidationError,
	extractPrefix,
	SALT_LENGTH,
	METADATA_LENGTH,
} from "../partial-keys";

// Create a test crypto provider
let counter = 0;
const testCrypto = {
	getRandomValues: (array: Uint8Array) => {
		// Deterministic for testing, but different on each call
		array.forEach((_, i) => {
			array[i] = (i + counter++) % 256;
		});
		return array;
	},
} as const;

const MIN_KEY_LENGTH = 12;

// Test keys - never use real keys in tests
const TEST_KEYS = {
	ANTHROPIC: "sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	ANTHROPIC_WITH_UNDERSCORE:
		"sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXgAA",
	OPENAI: "sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	OPENAI_PROJECT:
		"sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	OPENAI_PROJECT_COMPLEX:
		"sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX--XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	GOOGLE: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	GOOGLE_WITH_UNDERSCORE: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_XX-XXXXXXXXX",
	INVALID_SHORT: "sk-abc",
	MALFORMED: "invalid-key-format",
} as const;

describe("API Key Utilities", () => {
	describe("validateApiKey", () => {
		test("should detect missing key", () => {
			const result = validateApiKey("");
			expect(result).toEqual({
				isValid: false,
				error: {
					code: "MISSING_KEY",
					message: "API key is required",
				},
			});
		});

		test("should validate Anthropic keys", () => {
			const validResult = validateApiKey(TEST_KEYS.ANTHROPIC);
			expect(validResult).toEqual({
				isValid: true,
				provider: "ANTHROPIC",
			});

			const invalidResult = validateApiKey("sk-ant-invalid-format");
			expect(invalidResult).toMatchObject({
				isValid: false,
				error: { code: "UNRECOGNIZED_PROVIDER" },
			});
		});

		test("should validate Anthropic keys with underscores", () => {
			const validResult = validateApiKey(TEST_KEYS.ANTHROPIC_WITH_UNDERSCORE);
			expect(validResult).toEqual({
				isValid: true,
				provider: "ANTHROPIC",
			});
		});

		test("should validate OpenAI keys", () => {
			const validResult = validateApiKey(TEST_KEYS.OPENAI);
			expect(validResult).toEqual({
				isValid: true,
				provider: "OPENAI",
			});

			const validProjectResult = validateApiKey(TEST_KEYS.OPENAI_PROJECT);
			expect(validProjectResult).toEqual({
				isValid: true,
				provider: "OPENAI",
			});
		});

		test("should validate complex OpenAI project keys", () => {
			const validResult = validateApiKey(TEST_KEYS.OPENAI_PROJECT_COMPLEX);
			expect(validResult).toEqual({
				isValid: true,
				provider: "OPENAI",
			});
		});

		test("should validate Google keys", () => {
			const validResult = validateApiKey(TEST_KEYS.GOOGLE);
			expect(validResult).toEqual({
				isValid: true,
				provider: "GOOGLE",
			});

			const invalidResult = validateApiKey("AIzaShortKey");
			expect(invalidResult).toMatchObject({
				isValid: false,
				error: { code: "UNRECOGNIZED_PROVIDER" },
			});
		});

		test("should validate Google keys with underscores and hyphens", () => {
			const validResult = validateApiKey(TEST_KEYS.GOOGLE_WITH_UNDERSCORE);
			expect(validResult).toEqual({
				isValid: true,
				provider: "GOOGLE",
			});
		});

		test("should handle unrecognized formats", () => {
			const result = validateApiKey(TEST_KEYS.MALFORMED);
			expect(result).toMatchObject({
				isValid: false,
				error: { code: "UNRECOGNIZED_PROVIDER" },
			});
		});

		test("should validate and extract metadata from key", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			const result = validateApiKey(reconstructed);

			expect(result.isValid).toBe(true);
			expect(result.provider).toBe("OPENAI");
			expect(result.metadata).toBeDefined();
			expect(result.metadata?.version).toBe(1);
			expect(result.metadata?.timestamp).toBeDefined();
			expect(result.metadata?.splitId).toBeDefined();
		});

		test("should validate and extract metadata from Google key", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.GOOGLE,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			const result = validateApiKey(reconstructed);

			expect(result.isValid).toBe(true);
			expect(result.provider).toBe("GOOGLE");
			expect(result.metadata).toBeDefined();
			expect(result.metadata?.version).toBe(1);
			expect(result.metadata?.timestamp).toBeDefined();
			expect(result.metadata?.splitId).toBeDefined();
		});
	});

	describe("extractPrefix", () => {
		test("should extract Anthropic prefix", () => {
			const { prefix, leftover } = extractPrefix(TEST_KEYS.ANTHROPIC);
			expect(prefix).toStartWith("sk-ant-api");
			expect(leftover.length).toBeGreaterThan(0);
		});

		test("should extract OpenAI prefix", () => {
			const { prefix, leftover } = extractPrefix(TEST_KEYS.OPENAI);
			expect(prefix).toStartWith("sk-");
			expect(leftover.length).toBeGreaterThan(0);
		});

		test("should extract Google prefix", () => {
			const { prefix, leftover } = extractPrefix(TEST_KEYS.GOOGLE);
			expect(prefix).toBe("AIza");
			expect(leftover).toBe("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
			expect(leftover.length).toBeGreaterThan(MIN_KEY_LENGTH);
		});

		test("should handle keys without prefix", () => {
			const { prefix, leftover } = extractPrefix(TEST_KEYS.MALFORMED);
			expect(prefix).toBe("");
			expect(leftover).toBe(TEST_KEYS.MALFORMED);
		});

		test("should handle keys with metadata", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			const [baseKey] = reconstructed.split(".");
			const { prefix, leftover } = extractPrefix(baseKey);

			expect(prefix).toStartWith("sk-");
			expect(leftover.length).toBeGreaterThan(0);
			// Metadata should be stripped (check on leftover from baseKey)
			expect(leftover).not.toContain(".");
		});
	});

	describe("splitKeyWithPrefix", () => {
		test("should split and reassemble Anthropic key", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.ANTHROPIC,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			// Remove metadata for comparison
			const [baseKey] = reconstructed.split(".");
			expect(baseKey).toBe(TEST_KEYS.ANTHROPIC);
		});

		test("should split and reassemble OpenAI key", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			// Remove metadata for comparison
			const [baseKey] = reconstructed.split(".");
			expect(baseKey).toBe(TEST_KEYS.OPENAI);
		});

		test("should split and reassemble OpenAI project key", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI_PROJECT,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			// Remove metadata for comparison
			const [baseKey] = reconstructed.split(".");
			expect(baseKey).toBe(TEST_KEYS.OPENAI_PROJECT);
		});

		test("should split and reassemble Google key", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.GOOGLE,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			// Remove metadata for comparison
			const [baseKey] = reconstructed.split(".");
			expect(baseKey).toBe(TEST_KEYS.GOOGLE);

			// Verify the parts structure
			expect(serverPart).toStartWith("AIza");
			expect(serverPart.length).toBeGreaterThan(SALT_LENGTH);
			const [clientKeyPart, metadata] = clientPart.split(".");
			expect(clientKeyPart.length).toBeGreaterThan(SALT_LENGTH);
			expect(metadata).toBeDefined();
			expect(metadata.length).toBe(METADATA_LENGTH);
		});

		test("should split and reassemble Google key with underscores", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.GOOGLE_WITH_UNDERSCORE,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			// Remove metadata for comparison
			const [baseKey] = reconstructed.split(".");
			expect(baseKey).toBe(TEST_KEYS.GOOGLE_WITH_UNDERSCORE);
		});

		test("should split and reassemble complex OpenAI project key", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI_PROJECT_COMPLEX,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			// Remove metadata for comparison
			const [baseKey] = reconstructed.split(".");
			expect(baseKey).toBe(TEST_KEYS.OPENAI_PROJECT_COMPLEX);

			// Also verify the parts structure
			expect(serverPart).toStartWith("sk-proj-");
			expect(serverPart.length).toBeGreaterThan(SALT_LENGTH);
			const [clientKeyPart, metadata] = clientPart.split(".");
			expect(clientKeyPart.length).toBeGreaterThan(SALT_LENGTH);
			expect(metadata).toBeDefined();
			expect(metadata.length).toBe(METADATA_LENGTH);
		});

		test("should throw for short keys", () => {
			expect(() =>
				splitKeyWithPrefix(TEST_KEYS.INVALID_SHORT, testCrypto),
			).toThrow(KeyValidationError);
		});

		test("should generate different splits for same key", () => {
			const splits1 = splitKeyWithPrefix(TEST_KEYS.ANTHROPIC, testCrypto);
			const splits2 = splitKeyWithPrefix(TEST_KEYS.ANTHROPIC, testCrypto);
			expect(splits1).not.toEqual(splits2);

			// Both should reconstruct to same base key
			const reconstructed1 = reassembleKey(
				splits1.serverPart,
				splits1.clientPart,
			);
			const reconstructed2 = reassembleKey(
				splits2.serverPart,
				splits2.clientPart,
			);
			const [baseKey1] = reconstructed1.split(".");
			const [baseKey2] = reconstructed2.split(".");
			expect(baseKey1).toBe(TEST_KEYS.ANTHROPIC);
			expect(baseKey2).toBe(TEST_KEYS.ANTHROPIC);
		});

		test("should handle minimum length keys", () => {
			const minKey = `sk-${"a".repeat(20)}`;
			const { serverPart, clientPart } = splitKeyWithPrefix(minKey, testCrypto);
			const reconstructed = reassembleKey(serverPart, clientPart);
			const [baseKey] = reconstructed.split(".");
			expect(baseKey).toBe(minKey);
		});

		test("should verify salt length is correct", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI,
				testCrypto,
			);
			const [clientKeyPart] = clientPart.split(".");
			expect(serverPart.slice(-16).length).toBe(16);
			expect(clientKeyPart.slice(-16).length).toBe(16);
			expect(serverPart.slice(-16)).toBe(clientKeyPart.slice(-16));
		});

		test("should include metadata in client part", () => {
			const { clientPart } = splitKeyWithPrefix(TEST_KEYS.OPENAI, testCrypto);
			const [, metadata] = clientPart.split(".");
			expect(metadata).toBeDefined();
			expect(metadata.length).toBe(32); // 8 + 16 + 8 characters
		});
	});

	describe("reassembleKey", () => {
		test("should detect salt mismatch", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI,
				testCrypto,
			);
			const [clientKeyPart, metadata] = clientPart.split(".");
			expect(() =>
				reassembleKey(serverPart, `${clientKeyPart}x.${metadata}`),
			).toThrow("salt does not match");
		});

		test("should validate reconstructed key", () => {
			// Use matching salt but invalid key structure
			const maliciousServer = "sk-invalid-abc|deadbeefdeadbeef";
			const maliciousClient =
				"1234deadbeefdeadbeef.0000000100000000000000000000abcd";
			expect(() => reassembleKey(maliciousServer, maliciousClient)).toThrow(
				"Unrecognized API key format",
			);
		});

		test("should reject invalid input types", () => {
			expect(() => reassembleKey("", "something")).toThrow("Invalid key parts");
			expect(() => reassembleKey("something", "")).toThrow("Invalid key parts");
			expect(() => reassembleKey(null, "something")).toThrow(
				"Invalid key parts",
			);
		});

		test("should reject parts with invalid salt length", () => {
			expect(() => reassembleKey("sk-part1-123", "part2-456")).toThrow(
				"Invalid key parts: parts too short",
			);
		});

		test("should preserve metadata during reassembly", () => {
			const { serverPart, clientPart } = splitKeyWithPrefix(
				TEST_KEYS.OPENAI,
				testCrypto,
			);
			const reconstructed = reassembleKey(serverPart, clientPart);
			const [, metadata] = reconstructed.split(".");
			expect(metadata).toBeDefined();
			expect(metadata.length).toBe(32);
		});
	});
});
