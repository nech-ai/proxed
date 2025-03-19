import {
	Container,
	Font,
	Head,
	Html,
	Section,
	Tailwind,
} from "@react-email/components";
import { Logo } from "./Logo";

export const lightVariables = {
	colors: {
		background: "hsl(0deg 0% 100%)",
		foreground: "hsl(222.2deg 47.4% 11.2%)",
		muted: "hsl(210deg 40% 96.1%)",
		"muted-foreground": "hsl(215.4deg 16.3% 46.9%)",
		popover: "hsl(0deg 0% 100%)",
		"popover-foreground": "hsl(222.2deg 47.4% 11.2%)",
		border: "hsl(214.3deg 31.8% 94.4%)",
		input: "hsl(214.3deg 31.8% 91.4%)",
		card: "hsl(0deg 0% 100%)",
		"card-foreground": "hsl(222.2deg 47.4% 11.2%)",
		primary: "hsl(222.2deg 47.4% 11.2%)",
		"primary-foreground": "hsl(210deg 40% 98%)",
		secondary: "hsl(210deg 40% 96.1%)",
		"secondary-foreground": "hsl(222.2deg 47.4% 11.2%)",
		accent: "hsl(210deg 40% 96.1%)",
		"accent-foreground": "hsl(222.2deg 47.4% 11.2%)",
		destructive: "hsl(0deg 100% 50%)",
		"destructive-foreground": "hsl(210deg 40% 98%)",
		ring: "hsl(215deg 20.2% 65.1%)",
	},
};

export default function Wrapper({ children }: { children: React.ReactNode }) {
	return (
		<Html lang="en">
			<Head>
				<Font
					fontFamily="Inter"
					fallbackFontFamily="Arial"
					fontWeight={400}
					fontStyle="normal"
				/>
			</Head>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								border: lightVariables.colors.border,
								input: lightVariables.colors.input,
								ring: lightVariables.colors.ring,
								background: lightVariables.colors.background,
								foreground: lightVariables.colors.foreground,
								primary: {
									DEFAULT: lightVariables.colors.primary,
									foreground: lightVariables.colors["primary-foreground"],
								},
								secondary: {
									DEFAULT: lightVariables.colors.secondary,
									foreground: lightVariables.colors["secondary-foreground"],
								},
								destructive: {
									DEFAULT: lightVariables.colors.destructive,
									foreground: lightVariables.colors["destructive-foreground"],
								},
								muted: {
									DEFAULT: lightVariables.colors.muted,
									foreground: lightVariables.colors["muted-foreground"],
								},
								accent: {
									DEFAULT: lightVariables.colors.accent,
									foreground: lightVariables.colors["accent-foreground"],
								},
								popover: {
									DEFAULT: lightVariables.colors.popover,
									foreground: lightVariables.colors["popover-foreground"],
								},
								card: {
									DEFAULT: lightVariables.colors.card,
									foreground: lightVariables.colors["card-foreground"],
								},
							},
						},
					},
				}}
			>
				<Section className="p-1">
					<Container className="border border-border border-solid bg-card p-6 text-card-foreground">
						<Logo />
						{children}
					</Container>
				</Section>
			</Tailwind>
		</Html>
	);
}
