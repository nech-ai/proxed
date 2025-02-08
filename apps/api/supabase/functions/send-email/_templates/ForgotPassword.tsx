import { Link, Text } from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";
import PrimaryButton from "./components/PrimaryButton.tsx";
import Wrapper from "./components/Wrapper.tsx";

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
		<Wrapper>
			<Text>
				Hey {name},<br />
				We received your password reset request.
			</Text>

			<Text>
				Your verification code:
				<br />
				<strong className="font-bold text-2xl">{otp}</strong>
			</Text>

			{url && (
				<>
					<Text>Alternatively, click the button below:</Text>

					<PrimaryButton href={url}>Reset Password &rarr;</PrimaryButton>

					<Text className="text-muted-foreground text-sm">
						Or copy this link if you prefer to use a different browser:
						<Link href={url}>{url}</Link>
					</Text>
				</>
			)}
		</Wrapper>
	);
}

ForgotPassword.subjects = {
	en: "Reset your password",
};

export default ForgotPassword;
