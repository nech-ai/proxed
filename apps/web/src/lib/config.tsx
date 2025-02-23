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
	name: "Proxed.AI",
	description: "Protect AI APIs Instantly - Just Update Your URL.",
	cta: "Secure Your AI API Now",
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
		title: "Secure AI APIs in Seconds—No SDK, No Backend Needed.",
		description:
			"Proxed.AI is the simplest way to protect AI API keys in iOS apps. Lock down your API credentials, verify device authenticity with Apple's DeviceCheck, and structure AI outputs—all without a backend. Just change your API URL and get instant security.",
		cta: "Start Protecting Your API",
		ctaDescription: "Open-source with a free tier.",
	},

	problemSolution: {
		problem: {
			title: "AI APIs Are Vulnerable to Abuse & Key Theft",
			description:
				"Without proper security, AI-powered apps are exposed to key leaks, unauthorized usage, and compliance risks. A stolen API key can result in massive costs and service disruption.",
			points: [
				{
					title: "Exposed API Keys",
					description:
						"Hardcoded keys in your app? Hackers will find them and exploit your AI services.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "No Control Over Requests",
					description:
						"Without authentication, anyone can call your AI API—leading to fraud, abuse, and skyrocketing costs.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Compliance & Security Risks",
					description:
						"Regulatory requirements demand secure API handling—exposed keys can lead to data breaches and compliance violations.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
			],
		},

		solution: {
			title: "Proxed.AI – API Security in One Simple URL Change",
			description:
				"Proxed.AI eliminates security risks by acting as a smart proxy between your app and AI providers.",
			points: [
				{
					title: "No SDK, No Backend Required",
					description:
						"Simply replace your AI API URL with Proxed.AI's secure endpoint—no extra code, no SDK dependencies.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Lock Down API Keys",
					description:
						"Your secret keys never reach the client. Proxed securely manages keys so they're never exposed or stolen.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "DeviceCheck Authentication",
					description:
						"Verify every request comes from a genuine iOS device—blocking bots, emulators, and fake requests.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Control AI Usage & Costs",
					description:
						"Set rate limits, monitor API requests, and prevent abuse with real-time tracking and analytics.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
			],
		},
	},

	features: [
		{
			name: "Secure Your AI API with One URL Change",
			description:
				"Proxed.AI acts as a secure proxy—just update your API URL and instantly protect your AI calls.",
			icon: <KeyIcon className="h-6 w-6" />,
			href: "/secure",
		},
		{
			name: "DeviceCheck Authentication",
			description:
				"Ensure only genuine, unmodified iOS devices can access your AI APIs—blocking fake requests and unauthorized users.",
			icon: <ShieldIcon className="h-6 w-6" />,
			href: "/device-check",
		},
		{
			name: "Rate Limiting & AI Cost Control",
			description:
				"Monitor API usage, set request limits, and prevent runaway costs automatically.",
			icon: <GaugeIcon className="h-6 w-6" />,
			href: "/rate-limiting",
		},
		{
			name: "Structured AI Responses",
			description:
				"Define response formats and enforce consistency—no more malformed AI outputs or unexpected JSON errors.",
			icon: <BrainIcon className="h-6 w-6" />,
			href: "/structured-responses",
		},
	],

	pricing: [
		{
			name: "Free",
			price: { monthly: "$0", yearly: "$0" },
			frequency: { monthly: "month", yearly: "year" },
			description: "Start securing your AI APIs—for free.",
			features: [
				"1 Project",
				"1000 API calls per month",
				"DeviceCheck authentication",
				"Real-time monitoring",
			],
			cta: "Start Free",
			popular: false,
		},
		{
			name: "Pro",
			price: { monthly: "$10", yearly: "$100" },
			frequency: { monthly: "month", yearly: "year" },
			description: "For growing apps that need more security & control.",
			features: [
				"Unlimited Projects",
				"10,000 API calls per month",
				"DeviceCheck authentication",
				"Advanced rate limiting",
				"Real-Time Logs & Monitoring",
			],
			cta: "Upgrade to Pro",
			popular: false,
		},
		{
			name: "Ultimate",
			price: { monthly: "$30", yearly: "$300" },
			frequency: { monthly: "month", yearly: "year" },
			description: "Enterprise-grade security & scalability.",
			features: [
				"Unlimited Projects",
				"50,000 API calls per month",
				"DeviceCheck authentication",
				"Advanced analytics & cost monitoring",
				"Dedicated support & SLA",
			],
			cta: "Secure Your AI API Now",
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
			{ text: "Privacy Policy", url: "/legal/privacy" },
			{ text: "Terms of Service", url: "/legal/terms" },
		],
		bottomText: "All rights reserved. © Proxed.AI",
		brandText: "Proxed.AI",
	},
};

export type SiteConfig = typeof siteConfig;
