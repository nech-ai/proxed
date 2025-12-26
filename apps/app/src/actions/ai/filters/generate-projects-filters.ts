"use server";

import { filterProjectsSchema } from "@/actions/schema";
import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";

const VALID_FILTERS = [
	"name",
	"start",
	"end",
	"bundleId",
	"deviceCheckId",
] as const;

function createPickMap<const T extends string>(keys: readonly T[]) {
	const result: Record<T, true> = {} as Record<T, true>;
	for (const key of keys) {
		result[key] = true;
	}
	return result;
}

export async function generateProjectsFilters(
	prompt: string,
	context?: string,
) {
	const stream = createStreamableValue();

	(async () => {
		const { partialOutputStream } = streamText({
			model: openai("gpt-4.1-nano"),
			system: `You are a helpful assistant that generates filters for a given prompt. \n
               Current date is: ${new Date().toISOString().split("T")[0]} \n
               ${context}
      `,
			output: Output.object({
				schema: filterProjectsSchema.pick(createPickMap(VALID_FILTERS)),
			}),
			prompt,
			temperature: 0.7,
		});

		for await (const partialOutput of partialOutputStream) {
			stream.update(partialOutput);
		}

		stream.done();
	})();

	return { object: stream.value };
}
