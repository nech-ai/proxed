import { Text } from "@react-email/components";
import { darkTheme } from "./Wrapper";

export default function SecurityNote({
	text = "If you didn't request this email, you can safely ignore it.",
}: {
	text?: string;
}) {
	return (
		<Text
			className="text-[14px] leading-[20px] italic"
			style={{ color: darkTheme.mutedForeground }}
		>
			{text}
		</Text>
	);
}
