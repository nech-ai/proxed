import { logger } from "./logger";
import type { ProviderType } from "../rest/types";

interface MetricLabels {
	provider: ProviderType;
	projectId: string;
	method: string;
	status: string;
	path?: string;
	error?: string;
}

interface LatencyHistogram {
	buckets: number[];
	values: Map<number, number>;
}

class MetricsCollector {
	private requestCounts = new Map<string, number>();
	private errorCounts = new Map<string, number>();
	private latencyHistograms = new Map<string, LatencyHistogram>();
	private lastFlush = Date.now();
	private flushInterval = 60000; // 1 minute

	/**
	 * Record a successful request
	 */
	recordRequest(labels: MetricLabels, latencyMs: number): void {
		const key = this.getKey(labels);

		// Increment request count
		this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);

		// Record latency
		this.recordLatency(key, latencyMs);

		// Check if we should flush
		this.checkFlush();
	}

	/**
	 * Record an error
	 */
	recordError(labels: MetricLabels & { error: string }): void {
		const key = this.getKey(labels);
		this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
		this.checkFlush();
	}

	/**
	 * Record latency in histogram buckets
	 */
	private recordLatency(key: string, latencyMs: number): void {
		let histogram = this.latencyHistograms.get(key);
		if (!histogram) {
			histogram = {
				// Latency buckets in milliseconds
				buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
				values: new Map(),
			};
			this.latencyHistograms.set(key, histogram);
		}

		// Find the appropriate bucket
		const bucketIndex = histogram.buckets.findIndex((b) => latencyMs <= b);
		const bucket =
			bucketIndex === -1
				? Number.POSITIVE_INFINITY
				: histogram.buckets[bucketIndex];

		histogram.values.set(bucket, (histogram.values.get(bucket) || 0) + 1);
	}

	/**
	 * Generate a unique key for metrics
	 */
	private getKey(labels: MetricLabels): string {
		return `${labels.provider}:${labels.projectId}:${labels.method}:${labels.status}`;
	}

	/**
	 * Check if metrics should be flushed
	 */
	private checkFlush(): void {
		const now = Date.now();
		if (now - this.lastFlush >= this.flushInterval) {
			this.flush();
		}
	}

	/**
	 * Flush metrics to logs (in production, this would send to a metrics service)
	 */
	private flush(): void {
		const metrics: any = {
			timestamp: new Date().toISOString(),
			requests: {},
			errors: {},
			latency: {},
		};

		// Aggregate request counts
		for (const [key, count] of this.requestCounts) {
			metrics.requests[key] = count;
		}

		// Aggregate error counts
		for (const [key, count] of this.errorCounts) {
			metrics.errors[key] = count;
		}

		// Aggregate latency histograms
		for (const [key, histogram] of this.latencyHistograms) {
			const latencyData: any = {};
			for (const [bucket, count] of histogram.values) {
				latencyData[bucket === Number.POSITIVE_INFINITY ? "inf" : bucket] =
					count;
			}
			metrics.latency[key] = latencyData;
		}

		// Log metrics (in production, send to metrics service)
		logger.info("Metrics flush", metrics);

		// Reset counters
		this.requestCounts.clear();
		this.errorCounts.clear();
		this.latencyHistograms.clear();
		this.lastFlush = Date.now();
	}

	/**
	 * Get current metrics without flushing
	 */
	getMetrics(): any {
		return {
			requests: Object.fromEntries(this.requestCounts),
			errors: Object.fromEntries(this.errorCounts),
			latency: Object.fromEntries(
				Array.from(this.latencyHistograms.entries()).map(([key, histogram]) => [
					key,
					Object.fromEntries(histogram.values),
				]),
			),
		};
	}
}

// Singleton instance
export const metrics = new MetricsCollector();

/**
 * Express-style middleware to automatically collect metrics
 */
export function collectMetrics(
	provider: ProviderType,
	projectId: string,
	method: string,
	status: number,
	latencyMs: number,
	error?: string,
): void {
	const labels: MetricLabels = {
		provider,
		projectId,
		method,
		status: status.toString(),
	};

	if (error) {
		metrics.recordError({ ...labels, error });
	} else {
		metrics.recordRequest(labels, latencyMs);
	}
}
