import { Text } from "@react-email/components";
import type { JSX } from "react";
import Divider from "./components/Divider";
import PrimaryButton from "./components/PrimaryButton";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";
import { getBaseUrl } from "@proxed/utils";

export function ExecutionError({
	name,
	model,
	recordId,
	errorType,
	errorMessage,
}: {
	name?: string | null;
	model?: string | null;
	recordId?: string | null;
	errorType?: string | null;
	errorMessage?: string | null;
}): JSX.Element {
	const baseUrl = getBaseUrl();
	const executionUrl = recordId ? `${baseUrl}/executions/${recordId}` : baseUrl;

	return (
		<Wrapper
			previewText={`Execution error for ${recordId || "ID unavailable"}`}
		>
			<Text
				className="text-[16px] leading-[26px] mb-[14px]"
				style={{ color: darkTheme.foreground }}
			>
				Hey {name || "there"},
				<br />
				<br />
				An error occurred while executing a flow for record{" "}
				<code>{recordId || "N/A"}</code> using the <code>{model || "N/A"}</code>{" "}
				model.
			</Text>

			{(errorType || errorMessage) && (
				<Text
					className="text-[14px] leading-[24px] mb-[28px] p-4 rounded-md"
					style={{
						color: darkTheme.mutedForeground,
						backgroundColor: darkTheme.card,
						border: `1px solid ${darkTheme.border}`,
					}}
				>
					<strong>Error Type:</strong> {errorType || "N/A"}
					<br />
					<strong>Message:</strong> {errorMessage || "N/A"}
				</Text>
			)}

			<Divider />

			<div className="text-center mb-[28px]">
				<PrimaryButton href={executionUrl}>
					View Execution Details →
				</PrimaryButton>
			</div>
		</Wrapper>
	);
}

ExecutionError.subjects = {
	en: "Proxed: Execution Error Occurred",
};

export default ExecutionError;
