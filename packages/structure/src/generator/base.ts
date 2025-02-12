import type { JsonSchema } from "../types";

export interface GeneratorOptions {
	schemaName?: string;
	importStyle?: "named" | "namespace";
	[key: string]: unknown;
}

export abstract class BaseGenerator<T> {
	protected options: GeneratorOptions;

	constructor(options: GeneratorOptions = {}) {
		this.options = {
			schemaName: "Schema",
			importStyle: "named",
			...options,
		};
	}

	abstract generate(schema: JsonSchema): string;

	protected handleError(error: unknown): never {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("Unknown generator error");
	}
}
