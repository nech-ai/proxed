import { Novu } from "@novu/node";
import { v4 as uuidv4 } from "uuid";
import { executionError } from "./workflows/execution-error/workflow";
import { highConsumption } from "./workflows/high-consumption/workflow";

const novu = new Novu(process.env.NOVU_SECRET_KEY!);

const API_ENDPOINT = "https://api.novu.co/v1";

export enum TriggerEvents {
	ExecutionError = "execution-error",
	HighConsumption = "high-consumption",
}

export enum NotificationTypes {
	Executions = "executions",
	Projects = "projects",
	Alerts = "alerts",
}

type TriggerUser = {
	subscriberId: string;
	email: string;
	fullName: string;
	avatarUrl?: string;
	teamId: string;
};

type TriggerPayload = {
	name: TriggerEvents;
	payload: any;
	user: TriggerUser;
	replyTo?: string;
	tenant?: string;
};

export async function trigger(data: TriggerPayload) {
	try {
		await novu.trigger(data.name, {
			to: {
				...data.user,
				subscriberId: `${data.user.teamId}_${data.user.subscriberId}`,
			},
			payload: data.payload,
			tenant: data.tenant,
			overrides: {
				email: {
					replyTo: data.replyTo,
					headers: {
						"X-Entity-Ref-ID": uuidv4(),
					},
				},
			},
		});
	} catch (error) {
		console.error(error);
	}
}

export async function triggerBulk(events: TriggerPayload[]) {
	try {
		await novu.bulkTrigger(
			events.map((data) => ({
				name: data.name,
				to: {
					...data.user,
					subscriberId: `${data.user.teamId}_${data.user.subscriberId}`,
				},
				payload: data.payload,
				tenant: data.tenant,
				overrides: {
					email: {
						replyTo: data.replyTo,
						headers: {
							"X-Entity-Ref-ID": uuidv4(),
						},
					},
				},
			})),
		);
	} catch (error) {
		console.error(error);
	}
}

type GetSubscriberPreferencesParams = {
	teamId: string;
	subscriberId: string;
};

export async function getSubscriberPreferences({
	subscriberId,
	teamId,
}: GetSubscriberPreferencesParams) {
	const response = await fetch(
		`${API_ENDPOINT}/subscribers/${teamId}_${subscriberId}/preferences?includeInactiveChannels=false`,
		{
			method: "GET",
			headers: {
				Authorization: `ApiKey ${process.env.NOVU_SECRET_KEY!}`,
			},
		},
	);

	return response.json();
}

type UpdateSubscriberPreferenceParams = {
	subscriberId: string;
	teamId: string;
	templateId: string;
	type: string;
	enabled: boolean;
};

export async function updateSubscriberPreference({
	subscriberId,
	teamId,
	templateId,
	type,
	enabled,
}: UpdateSubscriberPreferenceParams) {
	const response = await fetch(
		`${API_ENDPOINT}/subscribers/${teamId}_${subscriberId}/preferences/${templateId}`,
		{
			method: "PATCH",
			headers: {
				Authorization: `ApiKey ${process.env.NOVU_SECRET_KEY!}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				channel: {
					type,
					enabled,
				},
			}),
		},
	);

	return response.json();
}

const workflows = {
	executionError,
	highConsumption,
};

export { workflows };
