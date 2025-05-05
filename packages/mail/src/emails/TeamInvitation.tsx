import { Heading, Text } from "@react-email/components";
import type { JSX } from "react";
import PrimaryButton from "./components/PrimaryButton";
import UrlCopy from "./components/UrlCopy";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";

export function TeamInvitation({
	url,
	teamName,
}: {
	url: string;
	teamName: string;
}): JSX.Element {
	return (
		<Wrapper previewText={`Join the team ${teamName} on Proxed.AI`}>
			<Heading
				className="text-[24px] font-bold mb-[24px]"
				style={{ color: darkTheme.foreground }}
			>
				Join the team{" "}
				<span style={{ color: darkTheme.primary }}>{teamName}</span>
			</Heading>

			<Text
				className="text-[16px] leading-[26px] mb-[28px]"
				style={{ color: darkTheme.foreground }}
			>
				You have been invited to join the team {teamName}. Click the button
				below to accept the invitation and join the team.
			</Text>

			<div className="text-center mb-[28px]">
				<PrimaryButton href={url}>Join the team</PrimaryButton>
			</div>

			<UrlCopy url={url} />
		</Wrapper>
	);
}

TeamInvitation.subjects = {
	en: "You have been invited to join a team",
};

export default TeamInvitation;
