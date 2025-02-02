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
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "var(--radius)",
				sm: "var(--radius)",
			},
			animation: {
				marquee: "marquee var(--duration) linear infinite",
				"marquee-vertical": "marquee-vertical var(--duration) linear infinite",
				"border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				ripple: "ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite",
				orbit: "orbit calc(var(--duration)*1s) linear infinite",
			},
			keyframes: {
				marquee: {
					from: {
						transform: "translateX(0)",
					},
					to: {
						transform: "translateX(calc(-100% - var(--gap)))",
					},
				},
				"marquee-vertical": {
					from: {
						transform: "translateY(0)",
					},
					to: {
						transform: "translateY(calc(-100% - var(--gap)))",
					},
				},
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
				orbit: {
					"0%": {
						transform:
							"rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
					},
					"100%": {
						transform:
							"rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
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
