const { calculateCosts, formatCostsForDB, getModelPricing } = require('./lib/pricing.ts');

console.log('Testing Google AI Pricing...\n');

// Test 1: Gemini 2.5 Pro
console.log('Test 1: Gemini 2.5 Pro (1M input, 500K output)');
const result1 = calculateCosts({
  provider: 'GOOGLE',
  model: 'gemini-2.5-pro',
  promptTokens: 1000000,
  completionTokens: 500000,
});
console.log('Input cost:', result1.promptCost);
console.log('Output cost:', result1.completionCost);
console.log('Total cost:', result1.totalCost);
console.log('Expected: $1.25 + $5.00 = $6.25\n');

// Test 2: Gemini 2.5 Flash
console.log('Test 2: Gemini 2.5 Flash (2M input, 1M output)');
const result2 = calculateCosts({
  provider: 'GOOGLE',
  model: 'gemini-2.5-flash',
  promptTokens: 2000000,
  completionTokens: 1000000,
});
console.log('Input cost:', result2.promptCost);
console.log('Output cost:', result2.completionCost);
console.log('Total cost:', result2.totalCost);
console.log('Expected: $0.60 + $2.50 = $3.10\n');

// Test 3: Gemini 1.5 Flash
console.log('Test 3: Gemini 1.5 Flash (100K input, 50K output)');
const result3 = calculateCosts({
  provider: 'GOOGLE',
  model: 'gemini-1.5-flash',
  promptTokens: 100000,
  completionTokens: 50000,
});
console.log('Input cost:', result3.promptCost);
console.log('Output cost:', result3.completionCost);
console.log('Total cost:', result3.totalCost);
console.log('Expected: $0.0075 + $0.015 = $0.0225\n');

// Test 4: Format for DB
console.log('Test 4: Format for DB (Gemini 2.0 Flash)');
const result4 = formatCostsForDB({
  provider: 'GOOGLE',
  model: 'gemini-2.0-flash',
  promptTokens: 50000,
  completionTokens: 25000,
});
console.log('Formatted prompt cost:', result4.promptCost);
console.log('Formatted output cost:', result4.completionCost);
console.log('Formatted total cost:', result4.totalCost);
console.log('Expected: "0.005000", "0.010000", "0.015000"\n');

// Test 5: Unknown Google model
console.log('Test 5: Unknown Google model (fallback pricing)');
const result5 = calculateCosts({
  provider: 'GOOGLE',
  model: 'gemini-future-model',
  promptTokens: 1000000,
  completionTokens: 1000000,
});
console.log('Input cost:', result5.promptCost);
console.log('Output cost:', result5.completionCost);
console.log('Total cost:', result5.totalCost);
console.log('Expected: $0.30 + $1.50 = $1.80 (default pricing)\n');

console.log('All tests completed!');