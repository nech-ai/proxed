import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { deviceChecksRouter } from "./device-checks";
import { executionsRouter } from "./executions";
import { metricsRouter } from "./metrics";
import { notificationsRouter } from "./notifications";
import { projectsRouter } from "./projects";
import { providerKeysRouter } from "./provider-keys";
import { supportRouter } from "./support";
import { teamRouter } from "./team";
import { userRouter } from "./user";
import { vaultRouter } from "./vault";

export const appRouter = createTRPCRouter({
	user: userRouter,
	team: teamRouter,
	deviceChecks: deviceChecksRouter,
	providerKeys: providerKeysRouter,
	projects: projectsRouter,
	executions: executionsRouter,
	metrics: metricsRouter,
	notifications: notificationsRouter,
	support: supportRouter,
	vault: vaultRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
