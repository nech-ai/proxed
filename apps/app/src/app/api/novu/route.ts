import { serve } from "@novu/framework/next";
import { workflows } from "@proxed/notifications";

export const { GET, POST, OPTIONS } = serve({
	workflows: [workflows.executionError, workflows.highConsumption],
});
