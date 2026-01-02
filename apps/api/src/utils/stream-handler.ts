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
			let buffer = "";
			let dataLines: string[] = [];
			let eventName: string | undefined;
			let eventId: string | undefined;
			let retry: number | undefined;

			if (!reader) {
				throw new Error("No response body to stream");
			}

			const dispatchEvent = async () => {
				if (
					dataLines.length === 0 &&
					!eventName &&
					!eventId &&
					retry === undefined
				) {
					return;
				}

				await stream.writeSSE({
					data: dataLines.join("\n"),
					event: eventName,
					id: eventId,
					retry,
				});

				dataLines = [];
				eventName = undefined;
				eventId = undefined;
				retry = undefined;
			};

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					if (buffer.length > 0) {
						// Process any remaining buffered line
						const line = buffer.replace(/\r$/, "");
						if (line.startsWith("data:")) {
							dataLines.push(line.replace(/^data:\s?/, ""));
						} else if (line.startsWith("event:")) {
							eventName = line.replace(/^event:\s?/, "");
						} else if (line.startsWith("id:")) {
							eventId = line.replace(/^id:\s?/, "");
						} else if (line.startsWith("retry:")) {
							const value = Number.parseInt(line.replace(/^retry:\s?/, ""), 10);
							if (!Number.isNaN(value)) {
								retry = value;
							}
						}
					}
					await dispatchEvent();
					config?.onEnd?.();
					break;
				}

				const chunk = decoder.decode(value, { stream: true });
				config?.onData?.(chunk);

				// Parse SSE format with line buffering to handle split chunks
				buffer += chunk;
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";

				for (const rawLine of lines) {
					const line = rawLine.replace(/\r$/, "");

					if (line === "") {
						await dispatchEvent();
						continue;
					}

					if (line.startsWith(":")) {
						continue;
					}

					if (line.startsWith("data:")) {
						dataLines.push(line.replace(/^data:\s?/, ""));
						continue;
					}

					if (line.startsWith("event:")) {
						eventName = line.replace(/^event:\s?/, "");
						continue;
					}

					if (line.startsWith("id:")) {
						eventId = line.replace(/^id:\s?/, "");
						continue;
					}

					if (line.startsWith("retry:")) {
						const value = Number.parseInt(line.replace(/^retry:\s?/, ""), 10);
						if (!Number.isNaN(value)) {
							retry = value;
						}
					}
				}
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Stream error");
			config?.onError?.(err);
			logger.error(`SSE stream error: ${err.message}`);
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
			logger.error(`Raw stream error: ${err.message}`);
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
		contentType.includes("application/x-ndjson")
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
