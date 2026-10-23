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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // BrewDistrict24 Editorial Palette
        ivory: {
          DEFAULT: "#F5F1E7",
          50: "#FAF8F3",
          100: "#F5F1E7",
          200: "#E8E2D1",
          300: "#DDD4BD",
        },
        sage: {
          DEFAULT: "#9EAE86",
          light: "#B8C6A5",
          dark: "#83946B",
        },
        olive: {
          DEFAULT: "#536547",
          light: "#697E5B",
          dark: "#3E4C35",
          deep: "#2B3524",
        },
        citrus: {
          DEFAULT: "#E8F05A",
          hover: "#DCE54A",
          light: "#F2F78A",
        },
        tangerine: {
          DEFAULT: "#FF814F",
          hover: "#F26E38",
          dark: "#D9561E",
        },
        charcoal: {
          DEFAULT: "#20231E",
          soft: "#2E332B",
          muted: "#555A50",
          light: "#82877D",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "editorial-sm": "0 2px 0 #20231E",
        "editorial": "4px 4px 0 #20231E",
        "editorial-lg": "8px 8px 0 #20231E",
        "editorial-xl": "12px 12px 0 #20231E",
        "sculpture": "0 30px 60px -15px rgba(32, 35, 30, 0.25), 0 10px 20px -5px rgba(83, 101, 71, 0.2)",
      },
      animation: {
        "float-gentle": "floatGentle 6s ease-in-out infinite",
        "float-reverse": "floatReverse 7s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        floatGentle: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1.5deg)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(12px) rotate(-1.5deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
