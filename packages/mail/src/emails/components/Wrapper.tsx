import * as React from "react";
import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
	Tailwind,
	Link,
} from "@react-email/components";
import { Logo } from "./Logo";

// Dark theme colors
export const darkTheme = {
	background: "hsl(220, 17%, 6%)", // --background
	foreground: "hsl(220, 13%, 98%)", // --foreground
	card: "hsl(220, 17%, 9%)", // --card
	primary: "#61AFEF", // --primary
	secondary: "hsl(220, 13%, 15%)", // --secondary
	muted: "hsl(220, 13%, 15%)", // --muted
	mutedForeground: "hsl(220, 13%, 65%)", // --muted-foreground
	accent: "hsl(220, 13%, 20%)", // --accent
	border: "hsl(220, 13%, 15%)", // --border
};

interface WrapperProps {
	children: React.ReactNode;
	previewText?: string;
}

export default function Wrapper({ children, previewText }: WrapperProps) {
	return (
		<Html>
			<Head />
			{previewText && <Preview>{previewText}</Preview>}
			<Tailwind>
				<Body
					className="font-sans my-auto mx-auto"
					style={{
						fontFamily:
							"Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
						backgroundColor: darkTheme.background,
						color: darkTheme.foreground,
					}}
				>
					<Container
						className="p-[40px] my-[40px] mx-auto max-w-[500px]"
						style={{ backgroundColor: darkTheme.card }}
					>
						{/* Logo/Header Section */}
						<Section className="mb-[36px] text-center">
							<Logo />
						</Section>

						{/* Main Content */}
						<Section>{children}</Section>

						{/* Footer */}
						<Section
							className="mt-[36px] pt-[24px] text-center"
							style={{ borderTop: `1px solid ${darkTheme.border}` }}
						>
							<Text
								className="text-[13px] leading-[20px] m-0"
								style={{ color: darkTheme.mutedForeground }}
							>
								© {new Date().getFullYear()} Proxed.AI. All rights reserved.
							</Text>
							<Text
								className="text-[13px] leading-[20px] m-0"
								style={{ color: darkTheme.mutedForeground }}
							>
								<Link
									href="https://proxed.ai/legal/terms"
									className="underline"
									style={{ color: darkTheme.primary }}
								>
									Terms of Service
								</Link>{" "}
								•{" "}
								<Link
									href="https://proxed.ai/legal/privacy"
									className="underline"
									style={{ color: darkTheme.primary }}
								>
									Privacy Policy
								</Link>
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
