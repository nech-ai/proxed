import { Hr, Link, Section, Text } from "npm:@react-email/components@0.0.24";
import * as React from "npm:react@18.3.1";

export default function Footer() {
	return (
		<Section className="mt-8">
			<Hr className="border-border" />
			<Text className="text-center text-muted-foreground text-sm">
				Powered by{" "}
				<Link href="https://proxed.ai" className="text-primary underline">
					Proxed.AI
				</Link>
				{" • "}
				<Link
					href="https://proxed.ai/support"
					className="text-primary underline"
				>
					Help Center
				</Link>
			</Text>
		</Section>
	);
}
