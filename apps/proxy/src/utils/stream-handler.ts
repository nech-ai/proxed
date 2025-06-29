import { stream, streamSSE } from "hono/streaming";
import type { Context } from "hono";
import { logger } from "./logger";

export interface StreamConfig {
	onStart?: () => void;
	onData?: (chunk: string) => void;
	onError?: (error: Error) => void;
	onEnd?: () => void;
}

/**
 * Handle Server-Sent Events (SSE) streaming for AI responses
 */
export async function handleSSEStream(
	c: Context,
	response: Response,
	config?: StreamConfig,
): Promise<Response> {
	return streamSSE(c, async (stream) => {
		config?.onStart?.();

		try {
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("No response body to stream");
			}

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					config?.onEnd?.();
					break;
				}

				const chunk = decoder.decode(value, { stream: true });
				config?.onData?.(chunk);

				// Parse SSE format and forward
				const lines = chunk.split("\n");
				for (const line of lines) {
					if (line.startsWith("data: ")) {
						await stream.writeSSE({ data: line.slice(6) });
					}
				}
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Stream error");
			config?.onError?.(err);
			logger.error("SSE stream error", { error: err.message });
			await stream.writeSSE({ data: JSON.stringify({ error: err.message }) });
		} finally {
			await stream.close();
		}
	});
}

/**
 * Handle raw streaming for binary or text data
 */
export async function handleRawStream(
	c: Context,
	response: Response,
	config?: StreamConfig,
): Promise<Response> {
	return stream(c, async (stream) => {
		config?.onStart?.();

		try {
			const reader = response.body?.getReader();

			if (!reader) {
				throw new Error("No response body to stream");
			}

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					config?.onEnd?.();
					break;
				}

				await stream.write(value);

				// For text streams, we can decode and process
				if (config?.onData) {
					const chunk = new TextDecoder().decode(value, { stream: true });
					config.onData(chunk);
				}
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Stream error");
			config?.onError?.(err);
			logger.error("Raw stream error", { error: err.message });
			throw err; // Re-throw for proper error handling
		} finally {
			await stream.close();
		}
	});
}

/**
 * Detect if a response should be streamed based on headers
 */
export function shouldStream(response: Response): boolean {
	const contentType = response.headers.get("content-type") || "";
	return (
		contentType.includes("text/event-stream") ||
		contentType.includes("application/stream+json") ||
		response.headers.get("transfer-encoding") === "chunked"
	);
}

/**
 * Transform stream data on the fly (e.g., for filtering sensitive data)
 */
export class StreamTransformer extends TransformStream<Uint8Array, Uint8Array> {
	constructor(transform?: (chunk: string) => string) {
		const decoder = new TextDecoder();
		const encoder = new TextEncoder();

		super({
			transform(chunk, controller) {
				try {
					const text = decoder.decode(chunk, { stream: true });
					const transformed = transform ? transform(text) : text;
					controller.enqueue(encoder.encode(transformed));
				} catch (error) {
					controller.error(error);
				}
			},
		});
	}
}
