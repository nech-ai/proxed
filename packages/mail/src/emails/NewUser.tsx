import { Text } from "@react-email/components";
import type { JSX } from "react";
import Divider from "./components/Divider";
import OtpCode from "./components/OtpCode";
import PrimaryButton from "./components/PrimaryButton";
import SecurityNote from "./components/SecurityNote";
import UrlCopy from "./components/UrlCopy";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";

export function NewUser({
	url,
	name,
	otp,
}: {
	url: string;
	name: string;
	otp: string;
}): JSX.Element {
	return (
		<Wrapper
			previewText={`Welcome to proxed.ai! Confirm your email with code: ${otp}`}
		>
			<Text
				className="text-[16px] leading-[26px] mb-[28px]"
				style={{ color: darkTheme.foreground }}
			>
				Hey {name},
				<br />
				<br />
				Welcome to proxed.ai! Please confirm your email address using either
				method below:
			</Text>

			<OtpCode otp={otp} />

			<Divider />

			<div className="text-center mb-[28px]">
				<PrimaryButton href={url}>Confirm email →</PrimaryButton>
			</div>

			<UrlCopy url={url} />

			<SecurityNote />
		</Wrapper>
	);
}

NewUser.subjects = {
	en: "Welcome to proxed.ai!",
};

export default NewUser;
