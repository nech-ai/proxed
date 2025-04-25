import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
	project: "proj_gyqtwtsxavvmrltkcmxi",
	machine: "micro",
	runtime: "node",
	logLevel: "warn",
	maxDuration: 3600,
	retries: {
		enabledInDev: true,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
	dirs: ["jobs"],
	build: {
		extensions: [syncVercelEnvVars()],
	},
});
