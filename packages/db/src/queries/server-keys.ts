import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { serverKeysInPrivate } from "../schema";

export async function getServerKey(db: Database, providerKeyId: string) {
	const [result] = await db
		.select({
			keyValue: serverKeysInPrivate.keyValue,
		})
		.from(serverKeysInPrivate)
		.where(eq(serverKeysInPrivate.providerKeyId, providerKeyId))
		.limit(1);

	return result?.keyValue || null;
}
