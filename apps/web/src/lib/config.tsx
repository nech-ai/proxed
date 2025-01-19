import { Icons } from "@/components/icons";
import {
	BrainIcon,
	ShieldCheckIcon,
	GaugeIcon,
	ScrollTextIcon,
	ShieldIcon,
	KeyIcon,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
	name: "proxed.ai",
	description: "Create AI Agents with just a few lines of code.",
	cta: "Get Started",
	url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	keywords: [
		"AI Agent SDK",
		"Multi-Agent Systems",
		"Tool Integration",
		"Workflow Automation",
	],
	links: {
		email: "alex@proxed.ai",
		twitter: "https://twitter.com/nech_ai",
		github: "https://github.com/nech-ai/proxed",
	},
	hero: {
		title: "proxed.ai",
		description: "The simplest way to get an API for your AI wrapper on iOS",
		cta: "Get Started",
		ctaDescription: "Open-source, free during beta",
	},
	features: [
		{
			name: "Visual Schema Builder",
			description:
				"Define your AI response structure using an intuitive visual Zod editor.",
			icon: <BrainIcon className="h-6 w-6" />,
		},
		{
			name: "Cost Monitoring",
			description:
				"Track usage and expenses in real time to avoid budget surprises.",
			icon: <GaugeIcon className="h-6 w-6" />,
		},
		{
			name: "Rate Limiting",
			description:
				"Throttle requests per project to ensure controlled, predictable consumption of AI resources.",
			icon: <ShieldCheckIcon className="h-6 w-6" />,
		},
		{
			name: "Real-Time Logs",
			description:
				"View logs of incoming requests and responses for quick debugging and analytics.",
			icon: <ScrollTextIcon className="h-6 w-6" />,
		},
		{
			name: "DeviceCheck Integration",
			description:
				"Verify iOS device authenticity using Apple's DeviceCheck, protecting your API from abuse.",
			icon: <ShieldIcon className="h-6 w-6" />,
		},
		{
			name: "Secure API Keys",
			description:
				"Only partial provider keys are stored—your full keys never live on our servers.",
			icon: <KeyIcon className="h-6 w-6" />,
		},
	],
	pricing: [
		{
			name: "Free",
			price: { monthly: "$0", yearly: "$0" },
			frequency: { monthly: "month", yearly: "year" },
			description: "Perfect for to start.",
			features: [
				"1 Project",
				"1000 API calls per month",
				"DeviceCheck",
				"Cost monitoring",
				"Usage monitoring",
			],
			cta: "Get Started",
		},
		{
			name: "Pro",
			price: { monthly: "$10", yearly: "$100" },
			frequency: { monthly: "month", yearly: "year" },
			description: "Ideal for growing businesses.",
			features: [
				"Unlimited Projects",
				"10,000 API calls per month",
				"DeviceCheck",
				"Cost monitoring",
				"Usage monitoring",
			],
			popular: true,
			cta: "Get Started",
		},
		{
			name: "Ultimate",
			price: { monthly: "$30", yearly: "$300" },
			frequency: { monthly: "month", yearly: "year" },
			description: "Perfect for large organisations.",
			features: [
				"Unlimited Projects",
				"50,000 API calls per month",
				"DeviceCheck",
				"Cost monitoring",
				"Usage monitoring",
			],
			cta: "Get Started",
		},
	],
	footer: {
		socialLinks: [
			{
				icon: <Icons.github className="h-5 w-5" />,
				url: "https://github.com/nech-ai/proxed",
			},
			{
				icon: <Icons.twitter className="h-5 w-5" />,
				url: "https://twitter.com/nech_ai",
			},
		],
		links: [
			{ text: "About", url: "/about" },
			{ text: "Updates", url: "/updates" },
			{ text: "Privacy Policy", url: "/legal/privacy" },
			{ text: "Terms of Service", url: "/legal/terms" },
			{ text: "Cookie Policy", url: "/legal/cookies" },
		],
		bottomText: "All rights reserved.",
		brandText: "proxed.ai",
	},
};

export type SiteConfig = typeof siteConfig;
