import { Link, Text } from "@react-email/components";
import type { JSX } from "react";
import PrimaryButton from "./components/PrimaryButton";
import Wrapper from "./components/Wrapper";

export function Feedback({
	email,
	message,
}: {
	email: string;
	message: string;
}): JSX.Element {
	return (
		<Wrapper>
			<Text>
				Hey, <br /> we received feedback from {email}.
				<br />
				<br />
			</Text>

			<Text>
				<strong className="font-bold">Message:</strong>
				<br />
				{message}
			</Text>
		</Wrapper>
	);
}

Feedback.subjects = {
	en: "Feedback from Proxed.AI",
};

export default Feedback;
