import { logger } from "../../utils/logger";
import { logger as honoLogger } from "hono/logger";

export const loggerMiddleware = honoLogger((message, ...rest) => {
	logger.info(message, ...rest);
});
