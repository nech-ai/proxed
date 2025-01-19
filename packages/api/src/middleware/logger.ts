import { logger } from "@proxed/logger";
import { logger as honoLogger } from "hono/logger";

export const loggerMiddleware = honoLogger((message, ...rest) => {
  logger.info(message, ...rest);
});
