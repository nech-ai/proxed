import { randomUUID } from "node:crypto";
import type { deviceChecks } from "../db/schema";
import axios from "axios";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

export async function verifyDeviceCheckToken(
	deviceToken: Buffer,
	config: typeof deviceChecks.$inferSelect,
): Promise<boolean> {
	// 1. Create JWT with the credentials
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		iss: config.appleTeamId,
		iat: now,
		exp: now + 60 * 10,
		aud: "https://appleid.apple.com",
		sub: config.keyId,
	};

	const signedJwt = jwt.sign(payload, config.privateKeyP8, {
		algorithm: "ES256",
		header: {
			kid: config.keyId,
			alg: "ES256",
		},
	});

	// 2. POST to Apple device check endpoint
	try {
		const response = await axios.post(
			"https://api.devicecheck.apple.com/v1/validate_device_token",
			{
				device_token: deviceToken.toString("base64"),
				transaction_id: randomUUID(),
				timestamp: Date.now(),
			},
			{
				headers: {
					Authorization: `Bearer ${signedJwt}`,
					"Content-Type": "application/json",
				},
			},
		);
		// If Apple responds with success status 200, token is valid
		return response.status === 200;
	} catch (error: any) {
		logger.error("verifyDeviceCheckToken error", error.response?.data || error);
		return false;
	}
}
