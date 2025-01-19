import baseConfig from "@proxed/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  presets: [baseConfig],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
} satisfies Config;
