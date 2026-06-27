import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mist: "#dff4ff",
        dusk: "#e2d9ff",
        blush: "#f3c6d8",
        navy: "#08152d",
        ink: "#f7fbff"
      },
      fontFamily: {
        sans: [
          "\"Hiragino Maru Gothic ProN\"",
          "\"Yu Gothic\"",
          "\"Meiryo\"",
          "sans-serif"
        ]
      },
      boxShadow: {
        float: "0 24px 60px rgba(4, 15, 38, 0.28)",
        glow: "0 0 24px rgba(164, 214, 255, 0.22)"
      },
      animation: {
        drift: "drift 20s ease-in-out infinite alternate",
        breathe: "breathe 14s ease-in-out infinite",
        reveal: "reveal 1.2s ease forwards",
        pulseSoft: "pulseSoft 0.75s ease-out forwards"
      },
      keyframes: {
        drift: {
          "0%": { transform: "scale(1.08) translate3d(-2%, 0, 0)" },
          "50%": { transform: "scale(1.14) translate3d(0%, -1%, 0)" },
          "100%": { transform: "scale(1.1) translate3d(2%, 0, 0)" }
        },
        breathe: {
          "0%, 100%": { opacity: "0.88" },
          "50%": { opacity: "1" }
        },
        reveal: {
          "0%": { opacity: "0", transform: "translate3d(0, 28px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" }
        },
        pulseSoft: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "55%": { opacity: "1", transform: "scale(1.04)" },
          "100%": { opacity: "0", transform: "scale(1.02)" }
        }
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top, rgba(223, 244, 255, 0.2), transparent 42%), radial-gradient(circle at 82% 18%, rgba(243, 198, 216, 0.22), transparent 30%), linear-gradient(180deg, rgba(6, 16, 32, 0.5), rgba(5, 13, 29, 0.88))"
      }
    }
  },
  plugins: []
};

export default config;
