import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#ffffff",
        soft: "#f7f7f5",
        mist: "#efefec",
        charcoal: "#1d1d1f",
        graphite: "#424245",
        muted: "#6e6e73",
        line: "#d8d8d2",
        gold: "#d6a900",
        "gold-soft": "#f4df86",
      },
      boxShadow: {
        glow: "0 24px 70px rgba(29, 29, 31, 0.08)",
        lift: "0 18px 50px rgba(29, 29, 31, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
