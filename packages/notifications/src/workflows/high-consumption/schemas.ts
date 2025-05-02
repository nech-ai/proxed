import { z } from "zod";

export const payloadSchema = z.object({
	recordId: z.string().uuid().describe("The ID of the project"),
	projectName: z.string().describe("The name of the project"),
	threshold: z.number().optional(),
	timeWindowSeconds: z.number().optional(),
	currentRate: z.number().optional(),
	teamId: z.string().uuid().describe("The ID of the team"),
	type: z.string().default("alerts").describe("The type of the notification"),
});
