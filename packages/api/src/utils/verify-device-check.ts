import jwt from "jsonwebtoken";
import axios from "axios";
import type { Tables } from "@proxed/supabase/types";
import { randomUUID } from "node:crypto";

export async function verifyDeviceCheckToken(
	deviceToken: Buffer,
	config: Tables<"device_checks">,
): Promise<boolean> {
	// 1. Create JWT with the credentials
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		iss: config.apple_team_id,
		iat: now,
		exp: now + 60 * 10,
		aud: "https://appleid.apple.com",
		sub: config.key_id,
	};

	const headers = {
		algorithm: "ES256",
		keyid: config.key_id,
	} as jwt.SignOptions;

	const signedJwt = jwt.sign(payload, config.private_key_p8, headers);

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
		console.error("error", error.response.data);
		return false;
	}
}
