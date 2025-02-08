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
	description: "Protect your AI API keys with DeviceCheck.",
	cta: "Get Started",
	url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	keywords: ["AI API", "iOS AI Wrapper", "DeviceCheck", "API Protection"],
	links: {
		email: "alex@proxed.ai",
		twitter: "https://x.com/proxed_ai",
		github: "https://github.com/nech-ai/proxed",
	},
	hero: {
		title: "Proxed.AI - Secure AI Integration for iOS Apps",
		description:
			"Protect your API keys and control your AI responses with ease. Proxed.AI is a secure proxy backend that uses Apple's DeviceCheck to lock down your API keys and a visual schema builder to structure AI outputs.",
		cta: "Get Started",
		ctaDescription:
			"Open-source and free during Beta - add robust security to your app in minutes, not weeks.",
	},
	problemSolution: {
		problem: {
			title: "The Challenge",
			description:
				"Mobile developers are struggling to secure AI API keys. Without proper protection, your app and business are at risk.",
			points: [
				{
					title: "Compromised API Keys",
					description:
						'Hardcoding keys in apps leads to theft – "If you ever send it to a client, it will almost certainly be compromised," OpenAI experts warn.',
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Complex Backend Requirements",
					description:
						"Building a custom backend for security is time-consuming and complex (Device attestation, key storage, rate limiting – not core to your app's purpose).",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Financial Risk",
					description:
						"Unsecured API calls can result in major losses: unauthorized usage, huge bills, data exposure, and abuse of your AI services.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Compliance Issues",
					description:
						"Enterprises face compliance and trust issues when API secrets aren't handled properly. 94% of orgs have had API security incidents – this is a risk you can't ignore when deploying AI features.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
			],
		},
		solution: {
			title: "The Solution",
			description:
				"Proxed.AI provides a secure proxy backend for iOS apps, acting as a gatekeeper between your app and AI providers.",
			points: [
				{
					title: "Protects API Keys",
					description:
						"Your secret keys never live in the app. Proxed uses partial keys and cloud-stored secrets to ensure the client never sees the full key. Hackers get nothing, your key stays safe.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Device Attestation",
					description:
						"Uses Apple's DeviceCheck technology to verify each request comes from a genuine, unmodified app on a real device. Fake clients and scripted attacks are stopped cold.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Structured AI Responses",
					description:
						"You set the schema – e.g., \"This response should have 'title' and 'steps'.\" The AI's reply is validated to match, giving you reliable, parseable output every time. No more guesswork or errors handling AI replies.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Plug & Play Integration",
					description:
						"Developers can drop in our SDK and call our API endpoints instead of OpenAI's directly – that's it. We handle auth, validation, and even formatting. It's hours to implement versus weeks building a custom solution.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Monitoring & Control",
					description:
						"Get a web dashboard with real-time metrics (requests, latency, cost estimates) and set rate limits or alerts. Stay in control of usage and spend.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
			],
		},
	},
	features: [
		{
			name: "Secure Key Management",
			description:
				"Never expose your secret keys in the app. Proxed keeps them safe behind a proxy, so your OpenAI/LLM keys stay hidden and protected. No more leaked keys or surprise bills from misuse.",
			icon: <KeyIcon className="h-6 w-6" />,
		},
		{
			name: "DeviceCheck Verification",
			description:
				"Ensure every request comes from a real, untampered iOS device. We integrate with Apple's DeviceCheck to block illegitimate requests before they ever hit your API. No more bots or modified apps abusing your AI endpoints.",
			icon: <ShieldIcon className="h-6 w-6" />,
		},
		{
			name: "Structured Responses",
			description:
				"Get JSON results you can trust. Define a response schema visually, and Proxed.AI will enforce your AI's replies to fit that format, so parsing is a breeze and errors are reduced.",
			icon: <BrainIcon className="h-6 w-6" />,
		},
		{
			name: "Quick Integration",
			description:
				"Forget complicated cloud functions – with our Swift SDK, you can set up Proxed in under 10 minutes. Add the SDK, paste your partial key, and go – no backend coding required.",
			icon: <ZapIcon className="h-6 w-6" />,
		},
		{
			name: "Observability & Control",
			description:
				"Monitor usage in real-time with our dashboard. Set custom rate limits to cap abuse, view logs of requests/responses for debugging, and even swap AI models on the fly via the console. Take control of your AI features like never before.",
			icon: <GaugeIcon className="h-6 w-6" />,
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
				"Rate Limiting",
				"Real-Time Logs",
			],
			popular: false,
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
				"Rate Limiting",
				"Real-Time Logs",
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
				url: "https://x.com/proxed_ai",
			},
		],
		links: [
			{ text: "About", url: "/about" },
			{ text: "Updates", url: "/updates" },
			{ text: "Docs", url: "https://docs.proxed.ai" },
			{ text: "Privacy Policy", url: "/legal/privacy" },
			{ text: "Terms of Service", url: "/legal/terms" },
			{ text: "Cookie Policy", url: "/legal/cookies" },
		],
		bottomText: "All rights reserved.",
		brandText: "proxed.ai",
	},
};

export type SiteConfig = typeof siteConfig;
