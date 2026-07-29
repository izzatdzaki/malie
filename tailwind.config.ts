import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A5F",
          50: "#E8EDF3",
          100: "#D1DBE7",
          200: "#A3B7CF",
          300: "#7593B7",
          400: "#476F9F",
          500: "#1E3A5F",
          600: "#182E4C",
          700: "#122339",
          800: "#0C1726",
          900: "#060C13",
        },
        secondary: {
          DEFAULT: "#2563EB",
          50: "#EBF1FD",
          100: "#D7E3FB",
          200: "#AFC7F7",
          300: "#87ABF3",
          400: "#5F8FEF",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#1E1B4B",
        },
        accent: {
          DEFAULT: "#059669",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#059669",
          600: "#047857",
          700: "#065F46",
          800: "#064E3B",
          900: "#022C22",
        },
        danger: "#DC2626",
        warning: "#F59E0B",
        border: "rgb(var(--border) / <alpha-value>)",
        background: "#FAFBFC",
        surface: "#FFFFFF",
        "text-primary": "#1F2937",
        "text-secondary": "#6B7280",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
