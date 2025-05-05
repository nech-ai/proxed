import { getPlanByProductId, type PLANS } from "@/utils/plans";
import { updateTeamPlan } from "@/utils/plans-server";

import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (payload) => {
		switch (payload.type) {
			case "subscription.uncanceled":
			case "subscription.active": {
				const teamId =
					payload.data.metadata?.teamId ||
					payload.data.metadata?.organizationId;
				const planKey = getPlanByProductId(payload.data.productId);
				await updateTeamPlan(teamId as string, {
					email: payload.data.customer?.email ?? undefined,
					plan: planKey as keyof (typeof PLANS)[keyof typeof PLANS],
					canceled_at: null,
				});

				break;
			}

			// Subscription has been explicitly canceled by the user
			case "subscription.canceled": {
				const teamId =
					payload.data.metadata?.teamId ||
					payload.data.metadata?.organizationId;
				await updateTeamPlan(teamId as string, {
					canceled_at: payload.data.endsAt
						? payload.data.endsAt.toISOString()
						: new Date().toISOString(),
				});

				break;
			}

			// Subscription has been revoked/period has ended with no renewal
			case "subscription.revoked": {
				const teamId =
					payload.data.metadata?.teamId ||
					payload.data.metadata?.organizationId;
				await updateTeamPlan(teamId as string, {
					plan: "trial",
					canceled_at: new Date().toISOString(),
				});

				break;
			}
			default:
				console.log("Unknown event", payload.type);
				break;
		}
	},
});
