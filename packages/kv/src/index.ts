import "server-only";

import { Redis } from "@upstash/redis";

export const client = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL as string,
	token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});
