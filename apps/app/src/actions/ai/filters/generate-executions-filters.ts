"use server";

import { filterExecutionsSchema } from "@/actions/schema";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";

const VALID_FILTERS = [
	"projectId",
	"provider",
	"model",
	"finishReason",
	"start",
	"end",
];

export async function generateExecutionsFilters(
	prompt: string,
	context?: string,
) {
	const stream = createStreamableValue();

	(async () => {
		const { partialObjectStream } = await streamObject({
			model: openai("gpt-4.1-nano"),
			system: `You are a helpful assistant that generates filters for AI execution logs based on user queries. \n
               Current date is: ${new Date().toISOString().split("T")[0]} \n
               ${context}
      `,
			schema: filterExecutionsSchema.pick({
				...(VALID_FILTERS.reduce((acc: Record<string, boolean>, filter) => {
					acc[filter] = true;
					return acc;
				}, {}) as any),
			}),
			prompt,
			temperature: 0.7,
		});

		for await (const partialObject of partialObjectStream) {
			stream.update(partialObject);
		}

		stream.done();
	})();

	return { object: stream.value };
}
