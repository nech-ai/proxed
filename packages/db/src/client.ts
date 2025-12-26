import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { withReplicas } from "./replicas";
import * as schema from "./schema";

const primaryPool = postgres(process.env.DATABASE_PRIMARY_URL!, {
	prepare: false,
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
	connection: {
		application_name: "proxed-api",
	},
});

const lhrPool = postgres(process.env.DATABASE_LHR_URL!, {
	prepare: false,
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
	connection: {
		application_name: "proxed-api-lhr",
	},
});

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

export const connectDb = async () => {
	const replicaIndex = getReplicaIndexForRegion();

	return withReplicas(
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
};

export type Database = Awaited<ReturnType<typeof connectDb>>;

export type DatabaseWithPrimary = Database & {
	$primary?: Database;
	usePrimaryOnly?: () => Database;
};
