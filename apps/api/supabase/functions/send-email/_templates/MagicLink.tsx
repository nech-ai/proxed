import { Link, Text } from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";
import PrimaryButton from "./components/PrimaryButton.tsx";
import Wrapper from "./components/Wrapper.tsx";

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
		<Wrapper>
			<Text>
				Hey {name}, <br /> you requested a login email from Proxed.AI.
				<br />
				<br /> You can either enter the one-time password below manually in the
				application
			</Text>

			<Text>
				One-time password:
				<br />
				<strong className="font-bold text-2xl">{otp}</strong>
			</Text>

			<Text>or use this link:</Text>

			<PrimaryButton href={url}>Continue &rarr;</PrimaryButton>

			<Text className="text-muted-foreground text-sm">
				If you want to open the link in a different browser than your default
				one, copy and paste this link:
				<Link href={url}>{url}</Link>
			</Text>
		</Wrapper>
	);
}

MagicLink.subjects = {
	en: "Login to Proxed.AI",
};

export default MagicLink;
