import type { Config } from "tailwindcss";

const config = {
	darkMode: ["class"],
	content: [
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "1rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				sans: ["var(--font-geist-sans)"],
				mono: ["var(--font-geist-mono)"],
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				"color-1": "hsl(var(--color-1))",
				"color-2": "hsl(var(--color-2))",
				"color-3": "hsl(var(--color-3))",
				"color-4": "hsl(var(--color-4))",
				"color-5": "hsl(var(--color-5))",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "var(--radius)",
				sm: "var(--radius)",
			},
			animation: {
				ripple: "ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite",
			},
			keyframes: {
				"border-beam": {
					"100%": {
						"offset-distance": "100%",
					},
				},
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				ripple: {
					"0%, 100%": {
						transform: "translate(-50%, -50%) scale(1)",
					},
					"50%": {
						transform: "translate(-50%, -50%) scale(0.9)",
					},
				},
				"aurora-border": {
					"0%, 100%": {
						borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%",
					},
					"25%": {
						borderRadius: "47% 29% 39% 49% / 61% 19% 66% 26%",
					},
					"50%": {
						borderRadius: "57% 23% 47% 72% / 63% 17% 66% 33%",
					},
					"75%": {
						borderRadius: "28% 49% 29% 100% / 93% 20% 64% 25%",
					},
				},
				"aurora-1": {
					"0%, 100%": {
						top: "0",
						right: "0",
					},
					"50%": {
						top: "50%",
						right: "25%",
					},
					"75%": {
						top: "25%",
						right: "50%",
					},
				},
				"aurora-2": {
					"0%, 100%": {
						top: "0",
						left: "0",
					},
					"60%": {
						top: "75%",
						left: "25%",
					},
					"85%": {
						top: "50%",
						left: "50%",
					},
				},
				"aurora-3": {
					"0%, 100%": {
						bottom: "0",
						left: "0",
					},
					"40%": {
						bottom: "50%",
						left: "25%",
					},
					"65%": {
						bottom: "25%",
						left: "50%",
					},
				},
				"aurora-4": {
					"0%, 100%": {
						bottom: "0",
						right: "0",
					},
					"50%": {
						bottom: "25%",
						right: "40%",
					},
					"90%": {
						bottom: "50%",
						right: "25%",
					},
				},
			},
			backgroundSize: {
				"grid-1": "100% 100%",
				"grid-2": "50% 100%",
				"grid-3": "calc(100%/3) 100%",
				"grid-4": "25% 100%",
				"grid-5": "20% 100%",
				"grid-6": "calc(100%/6) 100%",
			},
			backgroundImage: {
				"grid-1":
					"linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
				"grid-2":
					"linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
				"grid-3":
					"linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
				"grid-4":
					"linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
				"grid-5":
					"linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
				"grid-6":
					"linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
			},
		},
	},
	variants: {
		extend: {
			backgroundColor: ["disabled"],
			opacity: ["disabled"],
			cursor: ["disabled"],
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/container-queries"),
		require("@tailwindcss/forms")({
			strategy: "base",
		}),
	],
} satisfies Config;

export default config;
