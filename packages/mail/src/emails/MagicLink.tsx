import { Text } from "@react-email/components";
import type { JSX } from "react";
import Divider from "./components/Divider";
import OtpCode from "./components/OtpCode";
import PrimaryButton from "./components/PrimaryButton";
import SecurityNote from "./components/SecurityNote";
import UrlCopy from "./components/UrlCopy";
import Wrapper from "./components/Wrapper";
import { darkTheme } from "./components/Wrapper";

export function MagicLink({
	url,
	name,
	otp,
}: {
	url: string;
	name: string;
	otp: string;
}): JSX.Element {
	return (
		<Wrapper previewText={`Your Proxed.AI login code: ${otp}`}>
			<Text
				className="text-[16px] leading-[26px] mb-[28px]"
				style={{ color: darkTheme.foreground }}
			>
				Hey {name},
				<br />
				<br />
				You requested a login email from Proxed.AI. You can authenticate using
				either method below:
			</Text>

			<OtpCode otp={otp} />

			<Divider />

			<div className="text-center mb-[28px]">
				<PrimaryButton href={url}>Continue to Proxed.AI →</PrimaryButton>
			</div>

			<UrlCopy url={url} />

			<SecurityNote />
		</Wrapper>
	);
}

MagicLink.subjects = {
	en: "Login to Proxed.AI",
};

export default MagicLink;
