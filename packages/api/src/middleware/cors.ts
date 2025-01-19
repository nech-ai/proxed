import { getBaseUrl } from "@proxed/utils";
import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: getBaseUrl(),
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
});
