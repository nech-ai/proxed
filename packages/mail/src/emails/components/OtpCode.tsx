import { Section, Text } from "@react-email/components";
import { darkTheme } from "./Wrapper";

export default function OtpCode({ otp }: { otp: string }) {
	return (
		<Section
			className="p-[24px] mb-[28px] text-center"
			style={{ backgroundColor: darkTheme.secondary }}
		>
			<Text
				className="text-[14px] leading-[20px] mb-[8px]"
				style={{ color: darkTheme.mutedForeground }}
			>
				One-time password
			</Text>
			<Text
				className="text-[36px] font-bold tracking-[2px] m-0"
				style={{ color: darkTheme.primary }}
			>
				{otp}
			</Text>
		</Section>
	);
}
