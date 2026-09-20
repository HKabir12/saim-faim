import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: "#0D3B2E",
          900: "#082A20",
          700: "#14503F",
          500: "#1F6B54",
          100: "#D9E8DF",
          50: "#F0F6F2",
        },
        gold: {
          DEFAULT: "#C8A24A",
          300: "#E6CF8E",
          600: "#A9832F",
          700: "#7A5C14",
        },
        ink: "#12241D",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
