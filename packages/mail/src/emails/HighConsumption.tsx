import { Text } from "@react-email/components";
import type { JSX } from "react";
import Divider from "./components/Divider";
import PrimaryButton from "./components/PrimaryButton";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";
import { getBaseUrl } from "@proxed/utils";

interface HighConsumptionProps {
	projectName?: string | null;
	projectId?: string | null;
	threshold?: number | null;
	timeWindowSeconds?: number | null;
	currentRate?: number | null;
}

export function HighConsumption({
	projectName,
	projectId,
	threshold,
	timeWindowSeconds,
	currentRate,
}: HighConsumptionProps): JSX.Element {
	const baseUrl = getBaseUrl();
	const projectUrl = projectId ? `${baseUrl}/projects/${projectId}` : baseUrl;
	const settingsUrl = baseUrl
		? `${baseUrl}/settings/account/notifications`
		: baseUrl;

	return (
		<Wrapper
			previewText={`High consumption alert for project ${projectName || "N/A"}`}
		>
			<Text
				className="text-[16px] leading-[26px] mb-[14px]"
				style={{ color: darkTheme.foreground }}
			>
				Hi there,
				<br />
				<br />
				We've detected unusually high API call volume for your project:
				<br />
				<code>{projectName || "(Project name not available)"}</code>
			</Text>

			<Text
				className="text-[14px] leading-[24px]"
				style={{ color: darkTheme.mutedForeground }}
			>
				{threshold && timeWindowSeconds ? (
					<>
						The configured threshold is <strong>{threshold} requests</strong>{" "}
						per <strong>{timeWindowSeconds} seconds</strong>.
						<br />
					</>
				) : null}
				{currentRate ? (
					<>
						Current rate:{" "}
						<strong>{Math.round(currentRate)} requests/second</strong>.
						<br />
						<br />
					</>
				) : null}
				Please review the project's usage to ensure it's operating as expected.
				You might consider adjusting rate limits or investigating client
				behavior.
			</Text>

			<div className="text-center mb-[28px]">
				<PrimaryButton href={projectUrl}>View Project Usage →</PrimaryButton>
			</div>

			<Divider />

			<Text
				className="text-[12px] leading-[20px]"
				style={{ color: darkTheme.mutedForeground }}
			>
				You can manage your notification preferences in your account settings:
				<br />
				<a
					href={settingsUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-500 underline"
				>
					Notification Settings
				</a>
			</Text>
		</Wrapper>
	);
}

HighConsumption.subjects = {
	en: "Proxed Alert: High API Consumption Detected",
};

export default HighConsumption;
