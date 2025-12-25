import type { MiddlewareHandler } from "hono";
import { getGeoContext } from "../../utils/geo";
import type { Context } from "../types";

/**
 * Middleware that extracts geo information from request headers
 * and makes it available in the context
 */
export const withGeo: MiddlewareHandler<Context> = async (c, next) => {
	// Extract geo context from request
	const geo = getGeoContext(c.req);

	// Set geo context
	c.set("geo", geo);

	await next();
};

export const geoMiddleware = withGeo;
