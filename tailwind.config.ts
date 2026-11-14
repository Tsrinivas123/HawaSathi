import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#07111F",
          850: "#0B192C",
          800: "#0F213A",
          700: "#1E3A5F",
          600: "#2B4C7E",
        },
        emerald: {
          500: "#10B981",
          600: "#059669",
          400: "#34D399",
        },
        surface: {
          bg: "#F5F8FA",
          card: "#FFFFFF",
          subtle: "#F1F5F9",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
