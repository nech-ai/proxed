import type { z } from "zod/v4";
import type { payloadSchema } from "./schemas";

export type PayloadSchema = z.infer<typeof payloadSchema>;
