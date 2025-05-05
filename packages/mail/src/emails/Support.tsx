import { Section, Text } from "@react-email/components";
import type { JSX } from "react";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";

export function Support({
	email,
	subject,
	category,
	priority,
	message,
}: {
	email: string;
	subject: string;
	category: string;
	priority: string;
	message: string;
}): JSX.Element {
	return (
		<Wrapper previewText={`Support request from ${email}: ${subject}`}>
			<Text
				className="text-[16px] leading-[26px] mb-[28px]"
				style={{ color: darkTheme.foreground }}
			>
				Hey,
				<br />
				<br />
				We received a support request from {email}.
			</Text>

			<Section
				className="p-[24px] mb-[28px]"
				style={{ backgroundColor: darkTheme.secondary }}
			>
				<Text
					className="text-[14px] leading-[20px] mb-[12px]"
					style={{ color: darkTheme.foreground }}
				>
					<span
						style={{ fontWeight: "bold", color: darkTheme.mutedForeground }}
					>
						Subject:
					</span>
					<br />
					{subject}
				</Text>

				<Text
					className="text-[14px] leading-[20px] mb-[12px]"
					style={{ color: darkTheme.foreground }}
				>
					<span
						style={{ fontWeight: "bold", color: darkTheme.mutedForeground }}
					>
						Category:
					</span>
					<br />
					{category}
				</Text>

				<Text
					className="text-[14px] leading-[20px] mb-[12px]"
					style={{ color: darkTheme.foreground }}
				>
					<span
						style={{ fontWeight: "bold", color: darkTheme.mutedForeground }}
					>
						Priority:
					</span>
					<br />
					{priority}
				</Text>

				<Text
					className="text-[14px] leading-[20px]"
					style={{ color: darkTheme.foreground }}
				>
					<span
						style={{ fontWeight: "bold", color: darkTheme.mutedForeground }}
					>
						Message:
					</span>
					<br />
					{message}
				</Text>
			</Section>
		</Wrapper>
	);
}

Support.subjects = {
	en: "Support request from Proxed.AI",
};

export default Support;
