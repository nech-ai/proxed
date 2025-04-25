import { z } from "zod";

export const payloadSchema = z.object({
	recordId: z.string().describe("Execution ID"),
	name: z.string().describe("The name of the user"),
	model: z.string().describe("The model that executed the flow"),
	errorType: z.string().describe("The type of the error"),
	errorMessage: z.string().describe("The error message"),
	type: z
		.string()
		.default("executions")
		.describe("The type of the notification"),
});
