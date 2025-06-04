import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { verifyAccessToken } from "../utils/auth";
import { withReplicas } from "./replicas";
import * as schema from "./schema";

const primaryPool = postgres(process.env.DATABASE_PRIMARY_URL!, {
	prepare: false,
});

const lhrPool = postgres(process.env.DATABASE_LHR_URL!, { prepare: false });

export const primaryDb = drizzle(primaryPool, {
	schema,
	casing: "snake_case",
});

const getReplicaIndexForRegion = () => {
	switch (process.env.FLY_REGION) {
		case "lhr":
			return 0;
		default:
			return 0;
	}
};

export const connectDb = async (accessToken?: string) => {
	const replicaIndex = getReplicaIndexForRegion();

	const baseDb = await withReplicas(
		primaryDb,
		[
			// Order of replicas is important
			drizzle(lhrPool, {
				schema,
				casing: "snake_case",
			}),
		],
		(replicas) => replicas[replicaIndex]!,
	);

	// If no access token, return regular database
	if (!accessToken) {
		return baseDb;
	}

	// Verify token and get session info
	const session = await verifyAccessToken(accessToken);
	if (!session?.jwt) {
		return baseDb;
	}

	// Create RLS context from JWT
	const token: SupabaseToken = {
		...session.jwt,
		role: session.jwt.role || "authenticated",
		email: session.jwt.email || session.user.email,
	};

	// Return RLS-wrapped database
	return {
		...baseDb,
		// Override transaction to always use RLS
		transaction: async (transaction: any, ...rest: any[]) => {
			return await baseDb.transaction(
				async (tx) => {
					try {
						// Set up Supabase RLS context
						await tx.execute(sql`
            -- auth.jwt()
            select set_config('request.jwt.claims', '${sql.raw(
							JSON.stringify(token),
						)}', TRUE);
            -- auth.uid()
            select set_config('request.jwt.claim.sub', '${sql.raw(
							token.sub ?? "",
						)}', TRUE);
            -- set local role
            set local role ${sql.raw(token.role ?? "anon")};
          `);

						return await transaction(tx);
					} finally {
						// Always reset the context
						await tx.execute(sql`
            -- reset
            select set_config('request.jwt.claims', NULL, TRUE);
            select set_config('request.jwt.claim.sub', NULL, TRUE);
            reset role;
          `);
					}
				},
				...rest,
			);
		},
		// Keep all other database methods
		query: baseDb.query,
		select: baseDb.select,
		insert: baseDb.insert,
		update: baseDb.update,
		delete: baseDb.delete,
		execute: baseDb.execute,
		$primary: (baseDb as any).$primary,
		usePrimaryOnly: (baseDb as any).usePrimaryOnly,
	};
};

export type Database = Awaited<ReturnType<typeof connectDb>>;

export type DatabaseWithPrimary = Database & {
	$primary?: Database;
	usePrimaryOnly?: () => Database;
};

// RLS types
export type SupabaseToken = {
	iss?: string;
	sub?: string;
	aud?: string[] | string;
	exp?: number;
	nbf?: number;
	iat?: number;
	jti?: string;
	role?: string;
	email?: string;
	user_metadata?: Record<string, any>;
};
