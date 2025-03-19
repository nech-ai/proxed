import { Text } from "@react-email/components";
import type { JSX } from "react";
import Wrapper from "./components/Wrapper";

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
		<Wrapper>
			<Text>
				Hey, <br /> we received a support request from {email}.
				<br />
				<br />
			</Text>

			<Text>
				<strong className="font-bold">Subject:</strong>
				<br />
				{subject}
			</Text>

			<Text>
				<strong className="font-bold">Category:</strong>
				<br />
				{category}
			</Text>

			<Text>
				<strong className="font-bold">Priority:</strong>
				<br />
				{priority}
			</Text>

			<Text>
				<strong className="font-bold">Message:</strong>
				<br />
				{message}
			</Text>
		</Wrapper>
	);
}

Support.subjects = {
	en: "Support request from Proxed.AI",
};

export default Support;
