import { Icons } from "@/components/icons";
import {
	BrainIcon,
	GaugeIcon,
	ShieldIcon,
	KeyIcon,
	ZapIcon,
	AlertTriangleIcon,
	CheckCircleIcon,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
	name: "proxed.ai",
	description: "Secure AI API Integration for iOS Apps in Seconds",
	cta: "Start Securing Your API",
	url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	keywords: [
		"AI API Security",
		"iOS AI Integration",
		"DeviceCheck",
		"LLM API Protection",
	],

	links: {
		email: "alex@proxed.ai",
		twitter: "https://x.com/proxed_ai",
		github: "https://github.com/nech-ai/proxed",
	},

	hero: {
		title: "Secure Your AI Keys in iOS Apps—No Backend Required",
		description:
			"proxed.ai protects your AI API credentials in mobile apps with just one URL change. Instantly verify genuine iOS devices, prevent credential theft, and control AI costs—without building a custom backend or SDK integration.",
		cta: "Secure Your AI APIs Now",
		ctaDescription: "Open-source and self-hostable. No vendor lock-in.",
	},

	problemSolution: {
		problem: {
			title: "AI APIs Are Vulnerable in Mobile Apps",
			description:
				"Embedding API keys in mobile apps is risky. Attackers can extract credentials, bypass authentication, and exploit your AI services—leading to data breaches, runaway costs, and compliance violations.",
			points: [
				{
					title: "API Keys Get Stolen",
					description:
						"Mobile app binaries can be easily decompiled. Any API key in your app will eventually be extracted and abused.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Anyone Can Access Your AI",
					description:
						"Without proper device verification, attackers can bypass your app entirely and make unlimited API calls from anywhere.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Out-of-Control AI Costs",
					description:
						"A single leaked API key can result in thousands of dollars in unauthorized usage before you detect and revoke it.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
			],
		},

		solution: {
			title: "proxed.ai – One URL Change, Complete Protection",
			description:
				"proxed.ai is a secure proxy for all your AI API calls. Just change your API endpoint and get enterprise-grade security instantly.",
			points: [
				{
					title: "Zero Backend Development",
					description:
						"No need to build a custom backend or implement complex token exchange. Just update your API URL and you're secured.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "No API Keys in Your App",
					description:
						"Your sensitive API credentials stay on the server. Your app only needs a lightweight, revocable access token.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Apple DeviceCheck Verification",
					description:
						"Verify each request comes from a legitimate, non-jailbroken iOS device to block emulators, bots, and scripted attacks.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Complete Cost Control",
					description:
						"Set granular rate limits, track usage patterns, and instantly revoke access to compromised devices or users.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
			],
		},
	},

	features: [
		{
			name: "One-Line Integration",
			description:
				"Simply replace your AI provider's URL with your Proxed endpoint. No SDKs to install, no backend to build—just instant security.",
			icon: <KeyIcon className="h-6 w-6" />,
			href: "/secure",
		},
		{
			name: "Hardware-Level Authentication",
			description:
				"Leverage Apple's DeviceCheck API to verify device authenticity at the hardware level, blocking emulators and preventing API abuse.",
			icon: <ShieldIcon className="h-6 w-6" />,
			href: "/device-check",
		},
		{
			name: "Intelligent Rate Limiting",
			description:
				"Protect against cost overruns with granular controls: limit by user, device, endpoint, or create custom throttling rules.",
			icon: <GaugeIcon className="h-6 w-6" />,
			href: "/rate-limiting",
		},
		{
			name: "Response Formatting",
			description:
				"Enforce consistent output formats from any AI model, ensuring your app always receives predictable, parseable responses.",
			icon: <BrainIcon className="h-6 w-6" />,
			href: "/structured-responses",
		},
	],

	pricing: [
		{
			name: "Starter",
			price: { monthly: "$2.50", yearly: "$25" },
			frequency: { monthly: "month", yearly: "year" },
			description: "Perfect for indie developers and early-stage projects.",
			features: [
				"1 Project",
				"1,000 API calls per month",
				"DeviceCheck authentication",
				"Real-time monitoring",
				"Basic analytics dashboard",
				"Email support",
			],
			cta: "Get Started",
			popular: false,
		},
		{
			name: "Pro",
			price: { monthly: "$10", yearly: "$100" },
			frequency: { monthly: "month", yearly: "year" },
			description:
				"Ideal for production apps that need reliable security and higher capacity.",
			features: [
				"Unlimited Projects",
				"10,000 API calls per month",
				"DeviceCheck authentication",
				"Advanced rate limiting rules",
				"Real-Time Logs & Monitoring",
				"Custom rate limit configurations",
				"Priority email support",
			],
			cta: "Upgrade to Pro",
			popular: true,
		},
		{
			name: "Ultimate",
			price: { monthly: "$30", yearly: "$300" },
			frequency: { monthly: "month", yearly: "year" },
			description:
				"Enterprise-grade security and analytics for high-volume apps.",
			features: [
				"Unlimited Projects",
				"50,000 API calls per month",
				"DeviceCheck authentication",
				"Advanced analytics & cost monitoring",
				"Detailed usage reports",
				"Custom integrations",
				"Dedicated support & SLA",
			],
			cta: "Get Ultimate Security",
			popular: false,
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
				url: "https://x.com/vahaah",
			},
		],
		links: [
			{ text: "Docs", url: "https://docs.proxed.ai" },
			{
				text: "Example Apps",
				url: "https://github.com/nech-ai/proxed-examples",
			},
			{ text: "Privacy Policy", url: "/legal/privacy" },
			{ text: "Terms of Service", url: "/legal/terms" },
		],
		bottomText: "All rights reserved. © proxed.ai",
		brandText: "proxed.ai",
	},
};

export type SiteConfig = typeof siteConfig;
