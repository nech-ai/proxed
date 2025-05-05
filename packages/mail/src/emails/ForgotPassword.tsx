import { Text } from "@react-email/components";
import type { JSX } from "react";
import Divider from "./components/Divider";
import OtpCode from "./components/OtpCode";
import PrimaryButton from "./components/PrimaryButton";
import SecurityNote from "./components/SecurityNote";
import UrlCopy from "./components/UrlCopy";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";

export function ForgotPassword({
	url,
	name,
	otp,
}: {
	url: string;
	name: string;
	otp: string;
}): JSX.Element {
	return (
		<Wrapper previewText={`Your Proxed.AI password reset code: ${otp}`}>
			<Text
				className="text-[16px] leading-[26px] mb-[28px]"
				style={{ color: darkTheme.foreground }}
			>
				Hey {name},
				<br />
				<br />
				You requested a password reset. You can reset your password using either
				method below:
			</Text>

			<OtpCode otp={otp} />

			<Divider />

			<div className="text-center mb-[28px]">
				<PrimaryButton href={url}>Reset password →</PrimaryButton>
			</div>

			<UrlCopy url={url} />

			<SecurityNote />
		</Wrapper>
	);
}

ForgotPassword.subjects = {
	en: "Reset your password",
};

export default ForgotPassword;
