/**
 * Parses a combined token string into its API key part and token part.
 * The token part is assumed to be everything after the last dot.
 * The API key part is everything before the last dot.
 *
 * @param combinedToken The combined token string (e.g., "apiKeyPart1.apiKeyPart2.tokenPart").
 * @returns An object containing `apiKeyPart` and `tokenPart`.
 *          Returns undefined for parts if the token format is unexpected (e.g., no dot).
 */
export function parseCombinedToken(combinedToken: string): {
	apiKeyPart?: string;
	tokenPart?: string;
} {
	const lastDotIndex = combinedToken.lastIndexOf(".");

	if (lastDotIndex !== -1 && lastDotIndex < combinedToken.length - 1) {
		const apiKeyPart = combinedToken.substring(0, lastDotIndex);
		const tokenPart = combinedToken.substring(lastDotIndex + 1);
		return { apiKeyPart, tokenPart };
	}

	// If there's no dot, or the dot is the last character, it's not the expected format
	// for separating an API key part and a token part.
	// We can return undefined for both, or handle as per specific requirements.
	// For now, mimicking the previous auth logic's expectation of failure if no proper split.
	return { apiKeyPart: combinedToken, tokenPart: undefined };
}
