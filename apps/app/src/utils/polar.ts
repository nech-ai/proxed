import { Polar } from "@polar-sh/sdk";

export const api = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN as string,
	server: process.env.POLAR_ENVIRONMENT as "production" | "sandbox",
});
