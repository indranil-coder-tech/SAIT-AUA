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
        midnight: {
          950: "#040711",
          900: "#080D1A",
          850: "#0D1426",
          800: "#121C33",
          700: "#1E2B4D",
        },
        cyber: {
          violet: "#8B5CF6",
          glowViolet: "#A855F7",
          cyan: "#06B6D4",
          neonCyan: "#22D3EE",
          blue: "#3B82F6",
          amber: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E"
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        "spatial-card": "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        "spatial-glow": "0 0 50px -10px rgba(139, 92, 246, 0.4), 0 0 30px -10px rgba(6, 182, 212, 0.3)",
        "spatial-cyan": "0 0 35px -5px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        "spatial-projector": "0 30px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(139, 92, 246, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.15)",
      },
      animation: {
        "float-slow": "floatSlow 8s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(0.5deg)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
