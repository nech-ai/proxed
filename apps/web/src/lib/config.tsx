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
	description: "Secure AI API Integration for iOS Apps in Seconds",
	cta: "Start Free Trial",
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
		title: "Secure Your AI Keys Just Change the URL",
		description:
			"Instant DeviceCheck, split-key protection & cost guardrails. Open-source. No backend required.",
		cta: "Start Free Trial",
		ctaDescription: "14-day free trial · No credit card required",
	},

	problemSolution: {
		problem: {
			title: "AI APIs Are Vulnerable in Mobile Apps",
			description:
				"Embedding API keys in mobile apps is risky. Attackers can extract credentials, bypass authentication, and exploit your AI services—leading to data breaches, runaway costs, and compliance violations.",
			points: [
				{
					title: "Hard-coded Keys Are an Open Invitation",
					description:
						"Shipping an AI key inside your mobile app is like leaving the vault door ajar. Attackers decompile, extract, and hammer your provider's API—skyrocketing costs and exposing sensitive data.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Keys Leak—Always",
					description:
						"Binary scraping and proxy tools make extracting secrets trivial. Once leaked, your key lives on the internet forever.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Bots Bypass Your App",
					description:
						"Without device attestation, anybody can hit your endpoint directly, ignoring any client-side limits.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
				{
					title: "Runaway Bills",
					description:
						"A single compromised key can silently rack up thousands of dollars before you notice.",
					icon: <AlertTriangleIcon className="h-6 w-6" />,
				},
			],
		},

		solution: {
			title: "Proxed.AI — Single URL, Complete Defense",
			description:
				"Replace your provider URL with Proxed and get enterprise-grade security, observability, and cost control in seconds.",
			points: [
				{
					title: "Zero Backend, Zero SDK",
					description:
						"Just swap the endpoint—our cloud or self-hosted proxy handles the heavy lifting.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Split-Key Architecture",
					description:
						"Keep the sensitive half of your provider key on our server; store only a harmless fragment in the app.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Apple DeviceCheck Built-In",
					description:
						"Hardware-level attestation blocks emulators, scripts, and jailbroken devices before they hit your quota.",
					icon: <CheckCircleIcon className="h-6 w-6" />,
				},
				{
					title: "Granular Cost Guardrails",
					description:
						"Define per-project rate limits and spending ceilings; get alerts long before you blow the budget.",
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
			cta: "Start Free Trial",
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
			cta: "Start Free Trial",
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
			cta: "Start Free Trial",
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
		bottomText: "All rights reserved. © Proxed.AI",
		brandText: "Proxed.AI",
	},
};

export type SiteConfig = typeof siteConfig;
