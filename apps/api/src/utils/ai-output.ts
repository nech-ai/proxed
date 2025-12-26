import { Output } from "ai";
import type { z } from "zod";

type ZodSchema = z.ZodTypeAny;

function tryRepairTruncatedJson(text: string, error: unknown): string | null {
	if (!(error instanceof Error)) return null;
	if (!error.message.includes("Unexpected end of JSON input")) return null;

	const trimmed = text.trim();
	if (!trimmed.startsWith("{")) return null;
	if (trimmed.endsWith("}")) return null;

	return `${text}}`;
}

export function createStructuredOutput<T extends ZodSchema>(
	schema: T,
	name?: string,
	description?: string,
) {
	const baseOutput = Output.object({ schema, name, description });

	const output: typeof baseOutput = {
		responseFormat: baseOutput.responseFormat,
		parsePartialOutput: (options: { text: string }) =>
			baseOutput.parsePartialOutput(options),
		parseCompleteOutput: async (
			options: { text: string },
			context: Parameters<typeof baseOutput.parseCompleteOutput>[1],
		) => {
			try {
				return await baseOutput.parseCompleteOutput(options, context);
			} catch (error) {
				const repaired = tryRepairTruncatedJson(options.text, error);
				if (repaired && repaired !== options.text) {
					return baseOutput.parseCompleteOutput({ text: repaired }, context);
				}
				throw error;
			}
		},
	};

	return output;
}
