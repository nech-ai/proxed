import baseConfig from "@proxed/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  presets: [baseConfig],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
} satisfies Config;
