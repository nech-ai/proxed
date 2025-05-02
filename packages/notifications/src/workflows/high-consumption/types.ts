import type { z } from "zod";
import type { payloadSchema } from "./schemas";

export type PayloadSchema = z.infer<typeof payloadSchema>;
