/**
 * Format cost in a human-readable way
 * - Very small amounts (< $0.001): microdollars (e.g., 157.00µ$)
 * - Small amounts (< $0.01): millicents (e.g., 1.57m¢)
 * - Under $1: cents (e.g., 15.70¢)
 * - $1 and above: dollars (e.g., $1.57)
 */
export function formatCost(cost: number | null | undefined): string {
	if (cost === null || cost === undefined || cost === 0) {
		return "$0.00";
	}

	// For very small amounts (< $0.01), show in cents with higher precision
	if (cost < 0.01) {
		const cents = cost * 100;
		return `${cents.toFixed(3)}¢`;
	}

	// For amounts less than $1, show cents
	if (cost < 1) {
		const cents = cost * 100;
		return `${cents.toFixed(2)}¢`;
	}

	// For larger amounts, show dollars
	return `$${cost.toFixed(2)}`;
}
