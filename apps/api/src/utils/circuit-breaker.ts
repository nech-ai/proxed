import { logger } from "./logger";

export interface CircuitBreakerOptions {
	/**
	 * Number of consecutive failures before opening the circuit
	 */
	failureThreshold: number;
	/**
	 * Time in milliseconds to wait before attempting to close the circuit
	 */
	resetTimeout: number;
	/**
	 * Optional timeout for individual operations
	 */
	operationTimeout?: number;
	/**
	 * Optional function to determine if an error should count as a failure
	 */
	isFailure?: (error: Error) => boolean;
}

export enum CircuitState {
	CLOSED = "CLOSED",
	OPEN = "OPEN",
	HALF_OPEN = "HALF_OPEN",
}

export class CircuitBreaker<T> {
	private state: CircuitState = CircuitState.CLOSED;
	private failureCount = 0;
	private lastFailureTime?: number;
	private nextRetryTime?: number;
	private readonly name: string;

	constructor(
		name: string,
		private readonly options: CircuitBreakerOptions,
	) {
		this.name = name;
	}

	/**
	 * Execute an operation with circuit breaker protection
	 */
	async execute(operation: () => Promise<T>): Promise<T> {
		if (this.state === CircuitState.OPEN) {
			if (Date.now() < this.nextRetryTime!) {
				throw new Error(
					`Circuit breaker is OPEN for ${this.name}. Retry after ${new Date(
						this.nextRetryTime!,
					).toISOString()}`,
				);
			}
			// Transition to HALF_OPEN state
			this.state = CircuitState.HALF_OPEN;
			logger.info(`Circuit breaker ${this.name} transitioning to HALF_OPEN`);
		}

		try {
			const result = await this.executeWithTimeout(operation);
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure(error as Error);
			throw error;
		}
	}

	/**
	 * Execute operation with optional timeout
	 */
	private async executeWithTimeout(operation: () => Promise<T>): Promise<T> {
		if (!this.options.operationTimeout) {
			return operation();
		}

		return Promise.race([
			operation(),
			new Promise<T>((_, reject) =>
				setTimeout(
					() =>
						reject(
							new Error(
								`Operation timeout after ${this.options.operationTimeout}ms`,
							),
						),
					this.options.operationTimeout,
				),
			),
		]);
	}

	/**
	 * Handle successful operation
	 */
	private onSuccess(): void {
		if (this.state === CircuitState.HALF_OPEN) {
			this.state = CircuitState.CLOSED;
			this.failureCount = 0;
			logger.info(
				`Circuit breaker ${this.name} closed after successful operation`,
			);
		}
		// Reset failure count on success in CLOSED state
		if (this.state === CircuitState.CLOSED) {
			this.failureCount = 0;
		}
	}

	/**
	 * Handle failed operation
	 */
	private onFailure(error: Error): void {
		// Check if this error should count as a failure
		if (this.options.isFailure && !this.options.isFailure(error)) {
			return;
		}

		this.failureCount++;
		this.lastFailureTime = Date.now();

		if (this.state === CircuitState.HALF_OPEN) {
			// Failed in HALF_OPEN state, open the circuit again
			this.openCircuit();
		} else if (
			this.state === CircuitState.CLOSED &&
			this.failureCount >= this.options.failureThreshold
		) {
			// Threshold reached, open the circuit
			this.openCircuit();
		}
	}

	/**
	 * Open the circuit
	 */
	private openCircuit(): void {
		this.state = CircuitState.OPEN;
		this.nextRetryTime = Date.now() + this.options.resetTimeout;
	}

	/**
	 * Get current circuit state
	 */
	getState(): {
		state: CircuitState;
		failureCount: number;
		lastFailureTime?: number;
		nextRetryTime?: number;
	} {
		return {
			state: this.state,
			failureCount: this.failureCount,
			lastFailureTime: this.lastFailureTime,
			nextRetryTime: this.nextRetryTime,
		};
	}

	/**
	 * Manually reset the circuit breaker
	 */
	reset(): void {
		this.state = CircuitState.CLOSED;
		this.failureCount = 0;
		this.lastFailureTime = undefined;
		this.nextRetryTime = undefined;
		logger.info(`Circuit breaker ${this.name} manually reset`);
	}
}

/**
 * Create a circuit breaker instance with default options for API calls
 */
export function createAPICircuitBreaker(
	name: string,
	customOptions?: Partial<CircuitBreakerOptions>,
): CircuitBreaker<any> {
	const defaultOptions: CircuitBreakerOptions = {
		failureThreshold: 5,
		resetTimeout: 60000, // 1 minute
		operationTimeout: 30000, // 30 seconds
		isFailure: (error: Error) => {
			// Don't count client errors as circuit breaker failures
			if (error.message.includes("4") && !error.message.includes("429")) {
				return false;
			}
			return true;
		},
	};

	return new CircuitBreaker(name, { ...defaultOptions, ...customOptions });
}

// Global circuit breakers for external services
export const circuitBreakers = {
	openai: createAPICircuitBreaker("OpenAI"),
	anthropic: createAPICircuitBreaker("Anthropic"),
	google: createAPICircuitBreaker("Google"),
	database: createAPICircuitBreaker("Database", {
		failureThreshold: 3,
		resetTimeout: 30000, // 30 seconds
		operationTimeout: 5000, // 5 seconds
	}),
	redis: createAPICircuitBreaker("Redis", {
		failureThreshold: 10, // More tolerant since Redis failures are gracefully handled
		resetTimeout: 30000,
		operationTimeout: 3000,
	}),
};
