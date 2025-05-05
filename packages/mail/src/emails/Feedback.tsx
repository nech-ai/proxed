import { Section, Text } from "@react-email/components";
import type { JSX } from "react";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";

export function Feedback({
	email,
	message,
}: {
	email: string;
	message: string;
}): JSX.Element {
	return (
		<Wrapper previewText={`Feedback received from ${email}`}>
			<Text
				className="text-[16px] leading-[26px] mb-[28px]"
				style={{ color: darkTheme.foreground }}
			>
				Hey,
				<br />
				<br />
				We received feedback from {email}.
			</Text>

			<Section
				className="p-[24px] mb-[28px]"
				style={{ backgroundColor: darkTheme.secondary }}
			>
				<Text
					className="text-[14px] leading-[20px] mb-[8px] font-bold"
					style={{ color: darkTheme.mutedForeground }}
				>
					Message:
				</Text>
				<Text
					className="text-[16px] leading-[26px] m-0"
					style={{ color: darkTheme.foreground }}
				>
					{message}
				</Text>
			</Section>
		</Wrapper>
	);
}

Feedback.subjects = {
	en: "Feedback from Proxed.AI",
};

export default Feedback;
